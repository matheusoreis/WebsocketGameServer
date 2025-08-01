import { Service, Services } from "./services/service";

/**
 * Inicializa e gerencia o ciclo de vida dos serviços da aplicação.
 *
 * @param services Lista de serviços a serem inicializados
 * @throws Error se alguma dependência estiver faltando
 */
export function bootstrap(...services: Service[]) {
    const servicesHelper = new Services(services);
    const names = services.map((s) => s.constructor.name);

    /**
     * Função de shutdown que para todos os serviços.
     */
    const shutdown = () => {
        const reversed = [...services].reverse();

        for (const s of reversed) {
            if (s.stop) s.stop();
        }

        process.exit(0);
    };

    // Validar dependências de todos os serviços.
    for (const service of services) {
        if (!service.depends) continue;

        for (const dependency of service.depends) {
            if (!names.includes(dependency)) {
                throw new Error(
                    `Service '${service.constructor.name}' missing dependency '${dependency}'.`
                );
            }
        }
    }

    // Iniciar os serviços.
    for (const service of services) {
        if (service.start) {
            service.start(servicesHelper, shutdown);
        }
    }

    // Configurar shutdown
    process.on("SIGINT", shutdown);
}
