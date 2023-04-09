import puppeteer from "puppeteer";
import child_process from "child_process";
import path from "path";

(async () => {
  for (const arg of process.argv) {
    switch (arg) {
      case "--test": {
        child_process.spawn(
          "npx",
          ["webpack", "--config", path.resolve(__dirname, "../webpack")],
          {
            stdio: "inherit",
          }
        );

        const browser = await puppeteer.launch({});
        const page = await browser.newPage();

        page.exposeFunction("domTest", () => {});

        break;
      }
    }
  }
})().catch((reason) => {
  console.error(reason);
  process.exitCode = 1;
});
