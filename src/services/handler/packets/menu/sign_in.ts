import { Listener } from "../../../listener/service";
import { Services } from "../../../service";
import { Packet, PacketId } from "../packet";

export class SignIn implements Packet {
    id: number = PacketId.SignIn;

    constructor(private data: { username: string; password: string }) {}

    handle(services: Services, clientId: number): void {
        const listener: Listener | undefined = services.get("Listener");
        if (listener == undefined) {
            return;
        }

        const { username, password } = this.data;

        listener.send(clientId, { id: 2, data: { username, password } });
    }
}
