import SerialPort from "./SerialPort";
import Pino from "pino";

const logger = Pino().child({ namespace: "SerialPortPool" });

export default class SerialPortPool {
    static instance: SerialPortPool;
    ports: Record<string, SerialPort | undefined> = {};

    private constructor() {
        logger.trace("called constructor()");
    }

    static setLoggingLevel(logLevel: string = "info"): void {
        logger.level = logLevel
    }

    static getInstance(logLevel: string = "info"): SerialPortPool {
        logger.trace("called getInstance()");
        if (!this.instance) {
            logger.trace("instance was not created before - creating one");
            this.instance = new SerialPortPool();
        } else logger.trace("instance has been created - reuse");

        return this.instance;
    }

    set(path: string, port: SerialPort): SerialPort {
        logger.trace("called set()");
        this.ports[path] = port;
        return port;
    }

    get(path: string): SerialPort | null {
        logger.trace("called get()");
        return this.ports[path] || null;
    }

    new(path: string) {
        logger.trace("called new()");
        return this.set(path, new SerialPort(path));
    }

    close(path: string) {
        logger.trace("called close()");
        this.ports[path]?.close();
        delete this.ports[path];
    }
}
