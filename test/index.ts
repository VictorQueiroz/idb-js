import { Database } from "../src";
import { expect } from "chai";

domTest(async () => {
  const db = new Database<{
    recordingBlobParts: {
      recordingId: string;
      blob: Blob;
    };
    recordings: {
      id: string;
    };
  }>("test", 1);
  expect(
    await db
      .transaction("recordings", "readonly", {})
      .objectStore("recordings")
      .index("id")
      .get("1")
  ).to.be.null;
});
