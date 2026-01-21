export default class Cursor<T> implements AsyncIterator<T> {
  readonly #objectStore;
  readonly #query;
  readonly #direction;
  #cursorRequest: IDBRequest<IDBCursorWithValue | null> | null;
  #resolve:
    | ((
        value: IteratorResult<T, null> | PromiseLike<IteratorResult<T, null>>
      ) => void)
    | null;

  public constructor(
    objectStore: IDBObjectStore | IDBIndex,
    query?: IDBValidKey | IDBKeyRange | null,
    direction?: IDBCursorDirection
  ) {
    this.#objectStore = objectStore;
    this.#query = query ?? null;
    this.#direction = direction;
    this.#cursorRequest = null;
    this.#resolve = null;
  }

  public [Symbol.asyncIterator](): AsyncIterator<T> {
    return this;
  }

  public async next(): Promise<IteratorResult<T, null>> {
    return new Promise<IteratorResult<T, null>>((resolve, reject) => {
      this.#resolve = resolve;

      if (this.#cursorRequest === null) {
        this.#cursorRequest = this.#objectStore.openCursor(
          this.#query,
          this.#direction
        );
        this.#cursorRequest.onsuccess = () => {
          const cursor = this.#cursorRequest?.result?.value ?? null;
          const resolveFn = this.#resolve ?? null;

          if (resolveFn === null) {
            reject(new Error("Cursor resolve function is null"));
            return;
          }

          this.#resolve = null;

          if (cursor !== null) {
            resolveFn({ value: cursor, done: false });
          } else {
            resolveFn({ value: null, done: true });
          }
        };
      } else {
        this.#cursorRequest.result?.continue();
      }
    });
  }
}
