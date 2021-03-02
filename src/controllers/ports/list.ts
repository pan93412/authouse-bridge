import type { FastifyInstance } from "fastify";
import { getPortInfo } from "../../services/ports/list";

export default function PostsList(fastify: FastifyInstance): void {
    fastify.get("/ports/list", async function (request, reply) {
        return getPortInfo(request.log);
      });
}
