export const domTests = new Map<string, () => unknown>();

export function domTest(name: string, fn: () => unknown) {
  domTests.set(name, fn);
}

export function runTests() {
  (async () => {
    for (const t of domTests) {
      try {
        console.log("running: %s", t[0]);
        await Promise.resolve(t[1]());
      } catch (reason) {
        onFailure(`test "${t[0]}" failed with error: ${reason}`);
        return;
      }
    }
    onSuccess();
  })().catch((reason) => {
    onFailure(`failed to run tests with error: ${reason}`);
  });
}
