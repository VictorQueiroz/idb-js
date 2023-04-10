import DatabaseThread from "./DatabaseThread";
import ObjectStore from "./ObjectStore";

export default class Transaction<
  ModelMap extends Record<string, unknown>,
  K extends keyof ModelMap
> {
  readonly #value;
  public constructor(
    private readonly database: Promise<IDBDatabase | null>,
    private readonly thread: DatabaseThread,
    private readonly storeNames: K | K[],
    private readonly mode: IDBTransactionMode,
    private readonly options: IDBTransactionOptions
  ) {
    this.#value = this.database.then((db) =>
      db
        ? db.transaction(this.storeNames as string[], this.mode, this.options)
        : null
    );
  }
  public objectStore(name: K) {
    return new ObjectStore<ModelMap[K], K>(this.#value, thread, name);
  }
}
