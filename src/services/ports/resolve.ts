import type { FastifyLoggerInstance } from "fastify";
import { listPorts } from "./list";

/**
 * Resolve to path from @param id
 * @param id the ID from @see listPorts()
 * @returns the path of the ID
 */
export async function resolvePort(id: string, log?: FastifyLoggerInstance): Promise<string | null> {
  log?.trace("listing posts");
  const ports = await listPorts();
  for (let port of ports) {
    log?.debug(`SRC: ${id}, TGT: ${port.id}, MATCHED: ${port.id === id}`);
    if (port.id === id) {
      log?.trace(`Found a match.`);
      return port.path;
    }
  }
  log?.trace("Nothing matched.");
  return null;
}
