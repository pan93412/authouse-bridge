import type { FastifyLoggerInstance } from "fastify";
import { SerialPortPool } from "../../SerialPort";

SerialPortPool.setLoggingLevel("trace");
const pool = SerialPortPool.getInstance();
const MAX_TRY_LIMIT = 5;

/**
 * Write to the port path.
 * @param path The path.
 * @param message The thing to be sent.
 * @returns The written bytes.
 */
export async function writeToPort(path: string, message: string, log?: FastifyLoggerInstance): Promise<number> {
  log?.trace("writing to ${path}");

  const instance = pool.get(path) || pool.new(path);
  let written = await instance.write(message);

  console.log(written);

  return written;
}
