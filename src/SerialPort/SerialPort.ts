import Serialport from "serialport";
import Pino from "pino";

const baudRate = 9600;
const logger = Pino().child({ namespace: "SerialPort" });
type SerialPortError = Error | null | undefined;
type Listener<T extends string> = T extends "data"
  ? (arg0: string | Buffer) => void
  : T extends "open"
  ? () => void
  : T extends "close"
  ? () => void
  : never;

export default class SerialPort {
  path: string;
  port: Serialport;

  constructor(path: string, logLevel: string = "info") {
    logger.trace("called constructor()");
    this.path = path;
    this.port = new Serialport(
      path,
      {
        baudRate,
      },
      this.errorCallback
    );
    logger.level = logLevel;
    logger.trace("created a object");
  }

  private errorCallback(error: SerialPortError): void {
    logger.trace("called errorCallback()");
    if (error) logger.error(`${this.path}: ${error.name}: ${error.message}`);
  }

  /**
   * @param message 
   * @returns The written bytes
   */
  async write(message: string | Buffer): Promise<number> {
    logger.trace("called write()");
    return new Promise((resolve) => {
      logger.trace("called the promise returned by Promise.");
      this.port.write(message, (e, written) => {
        this.errorCallback(e);
        logger.trace(
          `${message} (${message
            .toString()
            .split("")
            .map((c) => c.charCodeAt(0))
            .join(" ")}) has been written to ${this.path}`
        );
        resolve(written);
      });
    });
  }

  on<T extends string>(event: T, listener: Listener<T>): void {
    logger.trace("called on()");
    this.port.on(event, listener);
    logger.trace(`the ${event} event has been set.`);
  }

  pipe<T extends NodeJS.WritableStream>(
    destination: T,
    options?: { end?: boolean }
  ): T {
    logger.trace("called pipe()");
    return this.port.pipe(destination, options);
  }

  get parsers() {
    return Serialport.parsers;
  }

  close(): void {
    logger.trace(`called close()`);
    this.port.close();
  }

  static async list() {
    logger.trace(`called list()`);
    return Serialport.list();
  }
}