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

// TODO: 多人登入或是還沒完全關閉的情況可能會掛掉。需要做個 Pool。
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

        connection.socket.send(JSON.stringify({
          type: InteractMode.RECV,
          data: dataString,
        }));
      });

      connection.socket.on("close", () => {
        serialPort.close();
      });

      serialPort.on("close", () => {
        connection.socket.close();
      });
    } else {
      connection.socket.close(WSCustomCloseCode.PARAM_INVALID);
    }
  });
}
