import Fastify from "fastify";
import controllers from "./src/controllers";

const fastify = Fastify({
  logger: {
    level: 'debug',
  },
});

// Declare a route
controllers.forEach(c => c(fastify, {}));

// Run the server!
const start = async () => {
  try {
    await fastify.listen(3000)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start();
