import { App } from "./app";
import { config } from "./config";

const server = new App();
server.listen(config.port);