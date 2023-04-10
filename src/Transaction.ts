import DatabaseThread from "./DatabaseThread";
import ObjectStore from "./ObjectStore";

export default class Transaction<
  ModelMap extends Record<string, unknown>,
  K extends keyof ModelMap
> {
  readonly #value;
  readonly #database;
  readonly #thread;
  readonly #storeNames;
  readonly #mode;
  readonly #options;
  public constructor(
    database: Promise<IDBDatabase | null>,
    thread: DatabaseThread,
    storeNames: K | K[],
    mode: IDBTransactionMode,
    options: IDBTransactionOptions
  ) {
    this.#database = database;
    this.#thread = thread;
    this.#storeNames = storeNames;
    this.#mode = mode;
    this.#options = options;
    this.#value = this.#database.then((db) =>
      db
        ? db.transaction(
            this.#storeNames as string[],
            this.#mode,
            this.#options
          )
        : null
    );
  }
  public objectStore(name: K) {
    return new ObjectStore<ModelMap[K], K>(this.#value, this.#thread, name);
  }
}
