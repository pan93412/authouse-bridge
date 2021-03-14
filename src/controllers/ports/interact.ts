import type { FastifyInstance } from "fastify";
import { resolvePort } from "../../services/ports/resolve";
import SerialPort from "serialport";

enum InteractMode {
  RECV = "recv",
  SEND = "send",
}

enum WSCustomCloseCode {
  PARAM_INVALID = 4000,
  PARAM_NOT_EXIST,
  FAILED_TO_OPEN,
}

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
        connection.socket.close(WSCustomCloseCode.PARAM_NOT_EXIST);
        return;
      }

      const serialPort = new SerialPort(path, { baudRate: 9600 }, (e) => {
        if (e) {
          connection.socket.close(WSCustomCloseCode.FAILED_TO_OPEN);
          return;
        }
      });

      const parser = serialPort.pipe(new SerialPort.parsers.Delimiter({ delimiter: '\r\n' }))
  
      connection.socket.on("message", (data) => {
        serialPort.write(data as Buffer, (error, bytesWritten) => {
          connection.socket.send(JSON.stringify({
            type: InteractMode.SEND,
            error,
            bytesWritten,
          }));
        });
      });

      parser.on("data", (data: Buffer | string) => {
        const dataString = data.toString();

        if (dataString === "!end!") connection.socket.close();

        connection.socket.send(JSON.stringify({
          type: InteractMode.RECV,
          data: dataString,
        }));
      });

      connection.socket.on("close", () => {
        serialPort.close();
      });
    } else {
      connection.socket.close(WSCustomCloseCode.PARAM_INVALID);
    }
  });
}
