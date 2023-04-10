import DatabaseThread from "./DatabaseThread";

export interface IOpenTransactionInfo {
  storeNames: string | string[];
  mode: IDBTransactionMode;
  options: IDBTransactionOptions;
}

export default class DeferredTransaction {
  #objectStore: Promise<unknown> | null;
  readonly #database: Promise<IDBDatabase | null>;
  readonly #openTransactionInfo: IOpenTransactionInfo;
  readonly #objectStoreName: string;
  readonly #thread;
  public constructor(
    database: Promise<IDBDatabase | null>,
    openTransactionInfo: IOpenTransactionInfo,
    thread: DatabaseThread,
    objectStoreName: string
  ) {
    this.#objectStore = null;
    this.#database = database;
    this.#thread = thread;
    this.#openTransactionInfo = openTransactionInfo;
    this.#objectStoreName = objectStoreName;
  }

  protected async openTransaction<R>(
    fn: ((value: IDBObjectStore) => Promise<R>) | ((value: IDBObjectStore) => R)
  ): Promise<R | null> {
    if (this.#objectStore !== null) {
      console.error("#openTransaction can only be called once");
      return null;
    }
    const promise = this.#thread.run(async () => {
      const db = await this.#database;
      if (!db) {
        return null;
      }
      return fn(
        db
          .transaction(
            this.#openTransactionInfo.storeNames,
            this.#openTransactionInfo.mode,
            this.#openTransactionInfo.options
          )
          .objectStore(this.#objectStoreName)
      );
    });
    this.#objectStore = promise;
    return promise;
  }
}
