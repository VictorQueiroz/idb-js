import { Database } from "../src";
import { expect } from "chai";
import { domTest, runTests } from "./testDb";
import { boundMethod } from "autobind-decorator";

function randomDbName() {
  return `db_${crypto.getRandomValues(new Uint32Array(1))[0]}`;
}

class RecordingDb extends Database<{
  recordingBlobParts: {
    recordingId: string;
    blob: Blob;
  };
  recordings: {
    id: string;
  };
}> {
  @boundMethod protected override onUpgradeNeeded(
    _: IDBVersionChangeEvent
  ): void {
    const db = this.request().result;
    const recordings = db.createObjectStore("recordings");
    recordings.createIndex("id", "id", {
      unique: true,
    });
    const recordingBlobParts = db.createObjectStore("recordingBlobParts");
    recordingBlobParts.createIndex("id", "id", {
      unique: true,
    });
  }
}

domTest("it should return null if no record is found", async () => {
  const db = new RecordingDb(randomDbName(), 1);
  expect(
    await (
      await db
        .transaction("recordings", "readonly", {})
        .objectStore("recordings")
        .index("id")
        .get("1")
    )?.value()
  ).to.be.null;
});

domTest("it should not return null if record is found", async () => {
  const db = new RecordingDb(randomDbName(), 1);
  expect(
    await (
      await db
        .transaction("recordings", "readwrite")
        .objectStore("recordings")
        .put(
          {
            id: "1",
          },
          "1"
        )
    )?.value()
  ).to.be.equal("1");
  expect(
    await (
      await db
        .transaction("recordings", "readonly", {})
        .objectStore("recordings")
        .index("id")
        .get("1")
    )?.value()
  ).to.be.deep.equal({ id: "1" });
});

runTests();
