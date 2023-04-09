import idbRequestToPromise from "./idbRequestToPromise";
import Transaction from "./Transaction";

export default class Database<
  ModelMap extends Record<string, unknown> = Record<string, unknown>
> {
  readonly #database: Promise<IDBDatabase | null>;
  readonly #request;
  public constructor(databaseName: string, version: number) {
    const req = indexedDB.open(databaseName, version);
    this.#request = req;
    this.#database = idbRequestToPromise(() => {
      req.onupgradeneeded = this.onUpgradeNeeded;
      return req;
    });
  }
  public transaction<K extends keyof ModelMap>(
    storeNames: K | K[],
    mode: IDBTransactionMode,
    options: IDBTransactionOptions
  ): Transaction<ModelMap, K> {
    return new Transaction<ModelMap, K>(
      this.result(),
      storeNames,
      mode,
      options
    );
  }
  public result() {
    return this.#database;
  }
  protected request() {
    return this.#request;
  }
  protected onUpgradeNeeded(_: IDBVersionChangeEvent) {}
}
