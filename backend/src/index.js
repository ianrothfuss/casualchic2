const express = require("express");
const { resolve } = require("path");
const { GracefulShutdownServer } = require("medusa-core-utils");

const loaders = require("@medusajs/medusa/dist/loaders/index").default;

(async () => {
  const app = express();

  try {
    const { container } = await loaders({
      directory: resolve(__dirname, ".."),
      expressApp: app,
    });

    const port = process.env.PORT || 9000;

    const server = GracefulShutdownServer.create(
      app.listen(port, (err) => {
        if (err) {
          return;
        }
        console.log(`Server is ready on port: ${port}`);
      })
    );

    // Handle graceful shutdown
    const gracefulShutDown = () => {
      server
        .shutdown()
        .then(() => {
          console.info("Gracefully shutting down medusa server");
          process.exit(0);
        })
        .catch((e) => {
          console.error("Error when shutting down medusa server", e);
          process.exit(1);
        });
    };

    process.on("SIGTERM", gracefulShutDown);
    process.on("SIGINT", gracefulShutDown);
  } catch (err) {
    console.error("Error starting Medusa server: ", err);
    process.exit(1);
  }
})();