/**
 * Interface base para todos os serviços.
 */
export interface Service {
    /**
     * Lista de nomes de serviços dos quais este serviço depende.
     */
    depends?: string[];

    /**
     * Método chamado quando o serviço deve ser iniciado.
     * @param services Instância do gerenciador de serviços para acessar dependências.
     * @param shutdown Função que pode ser chamada para desligar o serviço.
     */
    start?(services: Services, shutdown: () => void): void;

    /**
     * Método chamado quando o serviço deve ser finalizado.
     */
    stop?(): void;
}

/**
 * Gerenciador de serviços que registra, acessa e organiza serviços.
 */
export class Services {
    /**
     * Armazena os serviços registrados.
     */
    private services: Record<string, Service>;

    /**
     * Cria uma nova instância do gerenciador de serviços.
     * @param services Lista de instâncias de serviços a serem registrados.
     */
    constructor(services: Service[]) {
        this.services = {};

        for (const service of services) {
            this.services[service.constructor.name] = service;
        }
    }

    /**
     * Recupera um serviço registrado pelo nome.
     * @param name Nome do serviço.
     * @returns Instância do serviço, ou `undefined` se não encontrado.
     */
    public get<T extends Service>(name: string): T | undefined {
        return this.services[name] as T | undefined;
    }
}
