import type { FastifyInstance } from "fastify";
import { writeToPort } from "../../services/ports/write";
import { resolvePort } from "../../services/ports/resolve";

interface IParams {
  path: string;
}

interface IBody {
  message: string;
}

function isIParams(val: unknown): val is IParams {
  const v = val as IParams;
  return typeof v.path === "string";
}

function isIBody(val: unknown): val is IBody {
  return (
    typeof val === "object" &&
    typeof (val as IBody).message === "string"
  );
}

export default function PostsWrite(fastify: FastifyInstance): void {
  fastify.post("/ports/:path/write", async function (request, reply) {
    if (isIParams(request.params) && isIBody(request.body)) {
      const path = await resolvePort(request.params.path);
      if (path === null) {
        reply.code(400);
        request.log.info("/posts/write: the received ID seems invalid.");
        return {};
      }

      const written = await writeToPort(
        path,
        request.body.message,
        fastify.log.child({ from: "/ports/:path/write" })
      );

      return {
        written,
      };
    }

    request.log.info(
      "/posts/write: the received params or body seems invalid."
    );
    request.log.info(JSON.stringify(request.params, null, 4));
    request.log.info(JSON.stringify(request.body, null, 4));
    reply.code(400);
    return {};
  });
}
