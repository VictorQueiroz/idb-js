import puppeteer from "puppeteer";
import child_process, { ChildProcess, SpawnOptions } from "child_process";
import path from "path";
import express from "express";
import assert from "assert";
import { Server } from "http";

function command(cmd: string, args: string[], options: SpawnOptions = {}) {
  const p2 = child_process.spawn(cmd, args, {
    stdio: "inherit",
    ...options,
  });
  const onFinish = () =>
    new Promise<void>((resolve, reject) => {
      p2.on("exit", (code) => {
        if (code !== 0) {
          reject(
            new Error(`process "${cmd}" exited with non-zero code: ${code}`)
          );
        } else {
          resolve();
        }
      });
    });
  return {
    value: p2,
    onFinish,
  };
}

(async () => {
  for (const arg of process.argv) {
    switch (arg) {
      case "--test": {
        const browser = await puppeteer.launch({});
        const page = await browser.newPage();
        const watching = new Set<ChildProcess | Promise<Server>>();

        page.exposeFunction("onFailure", (...args: unknown[]) => {
          console.log(...args);
        });

        page.exposeFunction("onSuccess", async () => {
          console.log("tests finished successfully");
          for (const w of watching) {
            if ("then" in w) {
              const server = await w;
              server.close((err) => {
                assert.strict.ok(typeof err === "undefined");
              });
              continue;
            }
            assert.strict.ok(w.kill(0));
          }
          await browser.close();
          console.log("all closed");
        });

        /**
         * build the app
         */
        await command(
          "npx",
          ["webpack", "--config", path.resolve(__dirname, "../webpack")],
          { stdio: "ignore" }
        ).onFinish();

        const server = new Promise<Server>((resolve) => {
          const server = express()
            .use(express.static(path.resolve(__dirname, "../public")))
            .listen(3048, () => {
              resolve(server);
            });
          return server;
        });

        watching.add(server);

        /**
         * wait server to get active
         */
        await server;

        assert.strict.ok((await page.goto("http://localhost:3048")) !== null);

        watching.add(
          command(
            "npx",
            [
              "webpack",
              "--config",
              path.resolve(__dirname, "../webpack"),
              "-w",
            ],
            { stdio: "ignore" }
          ).value
        );

        break;
      }
    }
  }
})().catch((reason) => {
  console.error(reason);
  process.exitCode = 1;
});
