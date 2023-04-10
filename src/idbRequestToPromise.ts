export default function idbRequestToPromise<T>(getReq: () => IDBRequest<T>) {
  return new Promise<T | null>((resolve) => {
    let req: IDBRequest<T>;
    try {
      req = getReq();
    } catch (reason) {
      console.error("Failed to create request with error: %o", reason);
      resolve(null);
      return;
    }
    req.onerror = () => {
      console.error("Request failed with the following error: %o", req.error);
      resolve(null);
    };
    req.onsuccess = () => {
      resolve(req.result ?? null);
    };
  });
}
