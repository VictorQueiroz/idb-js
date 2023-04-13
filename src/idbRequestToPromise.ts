export interface IRequest<T> {
  value(): Promise<T | null>;
}

export default function idbRequestToPromise<T>(
  getReq: () => IDBRequest<T>
): IRequest<T> {
  let req: IDBRequest<T>;
  try {
    req = getReq();
  } catch (reason) {
    console.error("Failed to create request with error: %o", reason);
    return {
      value: async () => null,
    };
  }
  return {
    value: () =>
      new Promise<T | null>((resolve) => {
        req.onerror = () => {
          console.error(
            "Request failed with the following error: %o",
            req.error
          );
        };
        req.onsuccess = () => {
          resolve(req.result ?? null);
        };
      }),
  };
}
