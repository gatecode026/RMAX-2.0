/**
 * Local-only convenience: starts a throw-away in-memory MongoDB on 127.0.0.1:27017
 * for machines with neither MongoDB nor Docker. Data is lost when the process stops.
 *   npm run dev:db      (leave running, then `npm run seed` and `npm run dev` in other terminals)
 */
import { MongoMemoryServer } from "mongodb-memory-server";

async function main() {
  const server = await MongoMemoryServer.create({ instance: { port: 27017, ip: "127.0.0.1", dbName: "rmax" } });
  console.log(`In-memory MongoDB ready: ${server.getUri()}rmax`);
  const stop = async () => {
    await server.stop();
    process.exit(0);
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
