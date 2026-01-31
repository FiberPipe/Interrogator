import { DatabaseAPI } from "../../electron/features/database";
import { SerialAPI } from "../../electron/features/serial";
import { AppDataAPI } from "./app-data.types";
import { LogsAPI } from "./logs.types";

declare global {
    interface Window {
        appData: AppDataAPI;
        logger: LogsAPI;
        database: DatabaseAPI;
        serial: SerialAPI;
    }
}

export { };