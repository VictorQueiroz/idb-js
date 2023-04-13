# idb-javascript

## Installation

```
yarn add idb-javascript
```

## Usage

### Create your own database class

```ts
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
```

### Put a new object on the store

```ts
const db = new RecordingDb(randomDbName(), 1);
expect(
  await db.transaction("recordings", "readwrite").objectStore("recordings").put(
    {
      id: "1",
    },
    "1"
  )
).to.be.equal("1");
```
