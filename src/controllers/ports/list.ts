import type { FastifyInstance } from "fastify";
import { listPorts } from "../../services/ports/list";

export default function PostsList(fastify: FastifyInstance): void {
    fastify.get("/ports", async function (request, reply) {
        return listPorts(request.log.child({ from: '/ports' }));
      });
}
