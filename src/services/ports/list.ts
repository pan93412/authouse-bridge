import type { FastifyLoggerInstance } from "fastify";
import Pino from "pino";
import SerialPort from "serialport";
import sha1 from "sha1";

const logger = Pino();
const cache: Record<string, string> = {};

export interface IPortInfo extends SerialPort.PortInfo {
    id: string;
}

export function idOf(str: string, log?: FastifyLoggerInstance): string {
    if (!cache[str]) {
        log?.debug("cache was not hitted: generating new one");
        cache[str] = sha1(str);
    } else {
        log?.debug("cache was hitted: using the previous one");
    }
    return cache[str];
}

export async function getPortInfo(log?: FastifyLoggerInstance): Promise<SerialPort.PortInfo[]> {
    const originalList = await SerialPort.list();

    log?.debug("start fetching the port info");
    return originalList.map(v => ({
        ...v,
        id: idOf(v.path, log),
    }));
}
