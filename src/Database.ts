import DatabaseThread, { IDatabaseThread } from "./DatabaseThread";
import idbRequestToPromise from "./idbRequestToPromise";
import Transaction from "./Transaction";

export default class Database<
  ModelMap extends Record<string, unknown> = Record<string, unknown>
> {
  readonly #database: Promise<IDBDatabase | null>;
  readonly #request;
  readonly #thread;
  public constructor(
    databaseName: string,
    version: number,
    {
      thread = new DatabaseThread(),
    }: Partial<{
      thread: IDatabaseThread;
    }> = {}
  ) {
    const req = indexedDB.open(databaseName, version);
    this.#thread = thread;
    this.#request = req;
    this.#database = idbRequestToPromise(() => {
      req.onupgradeneeded = this.onUpgradeNeeded;
      return req;
    });
  }
  public transaction<K extends keyof ModelMap>(
    storeNames: K | K[],
    mode: IDBTransactionMode,
    options: IDBTransactionOptions = {}
  ): Transaction<ModelMap, K> {
    return new Transaction<ModelMap, K>(
      this.result(),
      this.#thread,
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
