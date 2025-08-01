import { Service, Services } from "../service";

/**
 * Serviço de log com timestamp e coloração ANSI.
 */
export class Logger implements Service {
    start(_services: Services): void {}

    /**
     * Retorna o timestamp atual formatado como string local.
     * @returns Timestamp atual.
     */
    private _getTimestamp(): string {
        return new Date().toLocaleString();
    }

    /**
     * Adiciona código ANSI de cor ao texto.
     * @param text Texto a ser colorido.
     * @param colorCode Código da cor ANSI.
     * @returns Texto com códigos ANSI aplicados.
     */
    private _colorText(text: string, colorCode: number): string {
        return `\x1b[${colorCode}m${text}\x1b[0m`;
    }

    /**
     * Imprime uma mensagem formatada no console.
     * @param level Rótulo do nível de log.
     * @param color Código da cor ANSI para a cor.
     * @param message Mensagem a ser registrada.
     */
    private _log(level: string, color: number, message: string): void {
        console.log(
            `${this._colorText(
                `[${level}]`,
                color
            )} ${this._getTimestamp()} - ${this._colorText(message, color)}`
        );
    }

    /**
     * Loga uma mensagem de informação.
     * @param message mensagem.
     */
    public info(message: string): void {
        this._log("INFO", 32, message);
    }

    /**
     * Loga uma mensagem de aviso.
     * @param message mensagem.
     */
    public warning(message: string): void {
        this._log("WARN", 33, message);
    }

    /**
     * Loga uma mensagem relacionada a jogador.
     * @param message mensagem.
     */
    public player(message: string): void {
        this._log("PLAYER", 34, message);
    }

    /**
     * Loga uma mensagem de erro.
     * @param message mensagem.
     */
    public error(message: string): void {
        this._log("ERROR", 31, message);
    }
}
