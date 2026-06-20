import { buildApp } from "./app";
import { env } from "./env";

const app = buildApp();

app
  .listen({ port: Number(env.PORT), host: "0.0.0.0" })
  .then(() => {
    app.log.info(`API ready -> http://localhost:${env.PORT}`);
  })
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
