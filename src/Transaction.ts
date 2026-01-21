import { IDatabaseThread } from "./DatabaseThread";
import ObjectStore from "./ObjectStore";

export default class Transaction<
  ModelMap extends Record<string, unknown>,
  K extends keyof ModelMap
> {
  readonly #database;
  readonly #thread;
  readonly #storeNames;
  readonly #mode;
  readonly #options;
  #objectStore: ObjectStore<unknown> | null;
  public constructor(
    database: Promise<IDBDatabase | null>,
    thread: IDatabaseThread,
    storeNames: K | K[],
    mode: IDBTransactionMode,
    options: IDBTransactionOptions
  ) {
    this.#objectStore = null;
    this.#database = database;
    this.#thread = thread;
    this.#storeNames = storeNames;
    this.#mode = mode;
    this.#options = options;
  }
  public objectStore(name: K) {
    if (!this.#objectStore) {
      this.#objectStore = new ObjectStore<unknown>(
        this.#database,
        {
          storeNames: this.#storeNames as string,
          mode: this.#mode,
          options: this.#options,
        },
        this.#thread,
        name as string
      );
    }
    return this.#objectStore as ObjectStore<ModelMap[K]>;
  }
}
