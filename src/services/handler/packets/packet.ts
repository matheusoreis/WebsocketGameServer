import { Services } from "../../service";
import { SignIn } from "./menu/sign_in";

/**
 * Interface base para todos os tipos os pacotes.
 */
export interface Packet {
    /**
     * Id do pacote `PacketId`
     */
    id: number;

    /**
     * Processa o pacote recebido.
     * @param services Gerenciador de serviços para acessar dependências
     * @param clientId Id do cliente que enviou o pacote
     */
    handle(services: Services, clientId: number): void;
}

/**
 * Enum que define os Ids únicos para cada tipo de pacote.
 */
export enum PacketId {
    _,
    SignIn,
    SignUp,
    CreateActor,
    SelectActor,
    Motd,
}

/**
 * Mapeamento dos Ids do pacote para suas funções.
 */
export const Packets: Record<number, (data: any) => Packet> = {
    [PacketId.SignIn]: (data) => new SignIn(data),
};
