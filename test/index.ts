import { Database } from "../src";
(async () => {
  const db = new Database<{
    recordingBlobParts: {
      recordingId: string;
      blob: Blob;
    };
    recordings: {
      id: string;
    };
  }>("test", 1);
  db.transaction("recordings", "readonly", {})
    .objectStore("recordings")
    .index("id");
})().catch((reason) => {
  console.error(reason);
});
