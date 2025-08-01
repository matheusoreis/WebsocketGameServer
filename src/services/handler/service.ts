import { Service, Services } from "../service";
import { Packets } from "./packets/packet";
import { Listener, PacketData } from "../listener/service";

/**
 * Serviço responsável por processar e direcionar pacotes recebidos pelo Listener.
 */
export class Handler implements Service {
    depends: string[] = ["Listener"];

    /**
     * Inicia o serviço Handler e configura o callback para processamento de pacotes.
     * @param services Gerenciador de serviços para acessar dependências
     */
    start(services: Services): void {
        const socket = services.get<Listener>("Listener");
        if (!socket) return;

        socket.onPacketReceived = (id, packet) => {
            this.onPacketReceived(services, id, packet);
        };
    }

    /**
     * Processa um pacote recebido, criando e executando o handler apropriado.
     * @param services Gerenciador de serviços para passar às instâncias de pacote
     * @param id Id do cliente que enviou o pacote
     * @param packet Dados do pacote recebido
     */
    onPacketReceived(services: Services, id: number, packet: PacketData) {
        const createPacket = Packets[packet.id];
        if (!createPacket) {
            return;
        }

        const instance = createPacket(packet.data);
        instance.handle(services, id);
    }
}
