import Fastify from "fastify";
import fastifyWebsocket from "fastify-websocket";
import fastifyCors from "fastify-cors";
import controllers from "./src/controllers";

const fastify = Fastify({
  logger: {
    level: "trace",
  },
});

fastify.register(fastifyWebsocket);
fastify.register(fastifyCors);

// Declare a route
controllers.forEach((c) => c(fastify, {}));

// Run the server!
const start = async () => {
  try {
    await fastify.listen(3001);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
