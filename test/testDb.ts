export const domTests = new Set<() => unknown>();

export function domTest(fn: () => unknown) {
  domTests.add(fn);
}

export function runTests() {}
