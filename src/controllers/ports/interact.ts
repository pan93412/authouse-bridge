import type { FastifyInstance } from "fastify";
import { resolvePort } from "../../services/ports/resolve";
import SerialPort from "serialport";
import { WSCustomCloseCode, InteractMode } from "../types/InteractType";

interface IParams {
  path: string;
}

function isIParams(val: unknown): val is IParams {
  const v = val as IParams;
  return typeof v.path === "string";
}

export default function PostsWrite(fastify: FastifyInstance): void {
  fastify.get("/ports/:path", { websocket: true }, async function (connection, request) {
    if (isIParams(request.params)) {
      const path = await resolvePort(request.params.path);

      if (!path) {
        request.log.info(`the path parameter client sent didn't exist.`);
        connection.socket.close(WSCustomCloseCode.PARAM_NOT_EXIST);
        return;
      }

      const serialPort = new SerialPort(path, { baudRate: 9600 }, (e) => {
        if (e) {
          request.log.warn(`failed to start the serial port.`);
          if (e) request.log.warn(`reason: ${e.name} ${e.message}`);
          connection.socket.close(WSCustomCloseCode.FAILED_TO_OPEN);
          return;
        }
      });

      const parser = serialPort.pipe(new SerialPort.parsers.Delimiter({ delimiter: '\r\n' }))
  
      connection.socket.on("message", (data) => {
        serialPort.write(data as Buffer, (error, bytesWritten) => {
          request.log.info(`forwarded (SEND) ${data} from the client to the server.`);
          connection.socket.send(JSON.stringify({
            type: InteractMode.SEND,
            error,
            bytesWritten,
          }));
        });
      });

      parser.on("data", (data: Buffer | string) => {
        const dataString = data.toString();
        request.log.info(`forwarded (RECV) ${dataString} from the server to the client.`);
        connection.socket.send(JSON.stringify({
          type: InteractMode.RECV,
          data: dataString,
        }));
      });

      connection.socket.on("close", () => {
        serialPort.close((err) => {
          if (err) {
            request.log.warn("something went wrong when closing the connection");
            request.log.warn(`${err?.name}: ${err?.message}`);
          } else {
            request.log.info("the websocket connection has closed - serial port closed")
          }
        });
      });

      serialPort.on("close", () => {
        connection.socket.close();
        request.log.info("the serial port has closed - connection closed");
      });
    } else {
      connection.socket.close(WSCustomCloseCode.PARAM_INVALID);
      request.log.info("received invalid connection parameters - connection closed");
    }
  });
}
