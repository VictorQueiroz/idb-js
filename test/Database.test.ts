import { describe, it, expect } from "vitest";
import { Database } from "../src";
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

describe("Database", () => {
  it("should return null if no record is found", async () => {
    const db = new RecordingDb(randomDbName(), 1);
    expect(
      await db
        .transaction("recordings", "readonly", {})
        .objectStore("recordings")
        .index("id")
        .get("1")
    ).toBeNull();
  });

  it("should not return null if record is found", async () => {
    const db = new RecordingDb(randomDbName(), 1);
    expect(
      await db
        .transaction("recordings", "readwrite")
        .objectStore("recordings")
        .put(
          {
            id: "1",
          },
          "1"
        )
    ).toBe("1");
    expect(
      await db
        .transaction("recordings", "readonly", {})
        .objectStore("recordings")
        .index("id")
        .get("1")
    ).toEqual({ id: "1" });
  });

  it("should async iterate over an empty store and return done=true", async () => {
    const db = new RecordingDb(randomDbName(), 1);
    const expectedResults = new Array<{ id: string }>();
    for (let i = 0; i < 200; i++) {
      expectedResults.push({ id: i.toString() });
      expect(
        await db
          .transaction("recordings", "readwrite")
          .objectStore("recordings")
          .put({ id: i.toString() }, i.toString())
      ).to.be.equal(i.toString());
    }

    const cursor = await db
      .transaction("recordings", "readonly")
      .objectStore("recordings")
      .index("id")
      .openCursorIter(null, "next");

    if (cursor === null) {
      throw new Error("Cursor is null");
    }

    const results = [];
    for await (const result of cursor) {
      results.push(result);
    }

    expect(results).to.be.deep.equal(
      Array.from(expectedResults).sort((a, b) => a.id.localeCompare(b.id))
    );
  });
});
