import { bootstrap } from "./src/bootstrap";
import { Handler } from "./src/services/handler/service";
import { Listener } from "./src/services/listener/service";
import { Logger } from "./src/services/logger/service";

bootstrap(new Logger(), new Listener(8080, 100), new Handler());
