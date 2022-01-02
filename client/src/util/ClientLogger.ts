// client-logger -------------------------------------------------------------

// Configure and return a Pino logger for this browser-based application.

// The goal here is to allow developers to use the same "logger.<level>()"
// semantics on the client side that they get to use on the server side,
// with additional capabilities to dynamically change the client side level
// at which logging messages should be forwarded to the server.

// External Modules ----------------------------------------------------------

// Internal Modules ----------------------------------------------------------

import ClientClient from "../clients/ClientClient";
import {Level} from "../types";

// Private Objects -----------------------------------------------------------

// Map log level names to log level values
const LOG_LEVEL_MAP = new Map<string, number>();
LOG_LEVEL_MAP.set(Level.DEBUG, 20);
LOG_LEVEL_MAP.set(Level.ERROR, 50);
LOG_LEVEL_MAP.set(Level.FATAL, 60);
LOG_LEVEL_MAP.set(Level.INFO, 30);
LOG_LEVEL_MAP.set(Level.TRACE, 10);
LOG_LEVEL_MAP.set(Level.WARN, 40);

// Transmit the specified object so that it can be logged (if level is loggable)
const write = async (object: any, level: number): Promise<void> => {
    if (level >= LOG_LEVEL) {
        object.level = level;
        try {
            await ClientClient.log(object);
        } catch (error) {
            console.error(`Error '${(error as Error).message}' logging client message`, object);
        }
    }
}
// Public Objects ------------------------------------------------------------

export let LOG_LEVEL: number = 30;

export const logger = require("pino")({
    base: null, // Remove "name", "pid", and "hostname" since we do not need them
    browser: {
        asObject: true,
        write: {
            debug:      (object: any) => { write(object, 20) },
            error:      (object: any) => { write(object, 50) },
            fatal:      (object: any) => { write(object, 60) },
            info:       (object: any) => { write(object, 30) },
            trace:      (object: any) => { write(object, 10) },
            warn:       (object: any) => { write(object, 40) },
        },
    },
    level: "trace",     // write() will ignore things based on dynamic level set
    timestamp: false,   // Server will timestamp for us
});

export const setLevel = (newName: string): void => {
    let newLevel: number | undefined = LOG_LEVEL_MAP.get(newName);
    if (newLevel) {
        LOG_LEVEL = newLevel;
    } else {
        newLevel = LOG_LEVEL_MAP.get(Level.INFO);
        LOG_LEVEL = newLevel ? newLevel : 30;
    }
}
setLevel("info"); // Set the default log level

export default logger;

