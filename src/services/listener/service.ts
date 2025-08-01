import { Service, Services } from "../service";
import { WebSocketServer, WebSocket, RawData } from "ws";
import { IncomingMessage } from "http";
import { Logger } from "../logger/service";

/**
 * Formato para pacotes enviados/recebidos.
 */
export type PacketData = {
    id: number;
    data: Record<string, any>;
};

interface Client {
    id: number;
    socket: WebSocket;
}

/**
 * Serviço responsável por gerenciar o listener do Websocket `ws`
 */
export class Listener implements Service {
    depends: string[] = ["Logger"];

    private server: WebSocketServer | undefined;
    private logger: Logger | undefined;
    private clients: (Client | undefined)[];
    private readonly port: number;

    /**
     * Cria uma nova instância do Listener.
     * @param port Porta onde o servidor WebSocket será iniciado
     * @param maxClients Número máximo de clientes conectados simultaneamente
     */
    constructor(port: number, maxClients: number) {
        this.port = port;
        this.clients = Array(maxClients).fill(undefined);
    }

    /**
     * Inicia o servidor WebSocket.
     * @param services Gerenciador de serviços para acessar dependências
     * @param shutdown Função de shutdown
     */
    public start(services: Services, _shutdown: () => void): void {
        this.logger = services.get("Logger");

        this.server = new WebSocketServer({ port: this.port });
        this.server.on("connection", (socket, req) =>
            this.handleConnection(socket, req)
        );

        this.logger?.info(`Servidor iniciado na porta ${this.port}`);
    }

    /**
     * Manipula uma nova conexão de cliente.
     * @param socket Socket WebSocket do cliente
     * @param req Requisição HTTP inicial
     */
    private handleConnection(socket: WebSocket, _req: IncomingMessage): void {
        const id = this.clients.indexOf(undefined);
        if (id === -1) {
            this.logger?.warning("Conexão reijeita, o servidor está cheio!");
            socket.close();
            return;
        }

        const client: Client = { id, socket };
        this.clients[id] = client;
        this.logger?.info(`Cliente com id ${id} conectado.`);

        socket.on("message", (data) => this.handleMessage(id, data));
        socket.on("close", () => this.disconnect(id));
        socket.on("error", () => this.disconnect(id));
    }

    /**
     * Processa uma mensagem recebida de um cliente.
     * @param clientId Id do cliente que enviou a mensagem
     * @param data Dados da mensagem
     */
    private handleMessage(clientId: number, data: RawData): void {
        try {
            const str = data.toString("utf-8");
            const parsed: PacketData = JSON.parse(str);

            if (!this.isValidPacket(parsed)) {
                throw new Error("Invalid packet format");
            }

            this.onPacketReceived?.(clientId, parsed);
        } catch (error) {
            this.logger?.warning(
                `Pacote com o formato inválido foi enviado pelo cliente ${clientId}`
            );
        }
    }

    /**
     * Valida se um objeto possui o formato correto de PacketData.
     * @param packet Objeto a ser validado
     * @returns True se o objeto é um PacketData válido
     */
    private isValidPacket(packet: any): packet is PacketData {
        return (
            typeof packet.id === "number" &&
            typeof packet.data === "object" &&
            packet.data !== null
        );
    }

    /**
     * Callback chamado sempre que um pacote válido é recebido.
     * @param id Id do cliente que enviou o pacote
     * @param packet Dados do pacote recebido
     */
    public onPacketReceived?: (id: number, packet: PacketData) => void;

    /**
     * Para o servidor WebSocket e desconecta todos os clientes.
     */
    public stop(): void {
        for (const client of this.clients) {
            if (client) {
                client.socket.close();
            }
        }

        this.clients.fill(undefined);
        this.server?.close(() => {
            this.logger?.info("O servidor foi fechado.");
        });
    }

    /**
     * Envia um pacote para um cliente específico.
     * @param id Id do cliente destinatário
     * @param packet Pacote a ser enviado
     * @returns True se o pacote foi enviado com sucesso, false caso contrário
     */
    public send(id: number, packet: PacketData): boolean {
        const client = this.clients[id];
        if (!client || client.socket.readyState !== WebSocket.OPEN) {
            return false;
        }

        try {
            const json = JSON.stringify(packet);
            client.socket.send(json);
            return true;
        } catch (err) {
            this.logger?.error(
                `Falha ao enviar o pacote para o cliente ${id}: ${String(err)}`
            );
            return false;
        }
    }

    /**
     * Envia um pacote para múltiplos clientes que atendem ao filtro especificado.
     * @param packet Pacote a ser enviado
     * @param filter Função que determina quais clientes devem receber o pacote
     */
    public sendTo(
        packet: PacketData,
        filter: (client: Client) => boolean
    ): void {
        const json = JSON.stringify(packet);

        for (const client of this.clients) {
            if (!client) continue;
            if (!filter(client)) continue;
            if (client.socket.readyState === WebSocket.OPEN) {
                client.socket.send(json);
            }
        }
    }

    /**
     * Desconecta um cliente específico do servidor.
     * @param id ID do cliente a ser desconectado
     */
    public disconnect(id: number): void {
        const client = this.clients[id];
        if (!client) return;

        client.socket.close();
        this.clients[id] = undefined;
        this.logger?.info(`Cliente ${id} deconectado.`);
    }
}
