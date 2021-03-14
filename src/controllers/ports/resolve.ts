import type { FastifyInstance } from "fastify";
import { resolvePort } from "../../services/ports/resolve";

interface IParams {
    id: string;
}

function isIParams(val: unknown): val is IParams {
    const v = val as IParams;
    return !!(v.id && typeof v.id === 'string');
}

export default function PostsResolve(fastify: FastifyInstance): void {
    fastify.get("/ports/resolve/:id", async function (request, reply) {
        if (isIParams(request.params)) {
            const resp = await resolvePort(request.params.id, fastify.log.child({ from: '/ports/resolve/:id' }));
            if (resp === null) {
                reply.code(404);
                return {};
            }
            return resp;
        }
        request.log.info("/posts/resolve: the received params seems invalid.");
        reply.code(400);
        return {};
      });
}
