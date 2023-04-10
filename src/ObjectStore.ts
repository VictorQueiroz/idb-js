import DatabaseThread from "./DatabaseThread";
import Index from "./ObjectStoreIndex";
import idbRequestToPromise from "./idbRequestToPromise";

export default class ObjectStore<Value, ObjectStoreNames> {
  readonly #value;
  readonly #thread;
  public constructor(
    transaction: Promise<IDBTransaction | null>,
    thread: DatabaseThread,
    name: ObjectStoreNames
  ) {
    this.#thread = thread;
    this.#value = this.#thread.run(() =>
      transaction.then((transaction) =>
        transaction ? transaction.objectStore(name as string) : null
      )
    );
  }
  public async put(value: Value) {
    const objectStore = await this.#value;
    if (objectStore === null) return null;
    return this.#toPromise(() => objectStore.put(value));
  }
  public async getAll(
    query?: IDBValidKey | IDBKeyRange | null,
    count?: number
  ) {
    const objectStore = await this.#value;
    if (objectStore === null) return null;
    return this.#toPromise<Value[]>(() => objectStore.getAll(query, count));
  }
  public async get(query: IDBValidKey | IDBKeyRange) {
    const objectStore = await this.#value;
    if (objectStore === null) return null;
    return this.#toPromise<Value>(() => objectStore.get(query));
  }
  public async openCursor(
    query?: IDBValidKey | IDBKeyRange | null,
    direction?: IDBCursorDirection
  ) {
    return (await this.#value)?.openCursor(query, direction) ?? null;
  }
  public async delete(key: IDBValidKey | IDBKeyRange) {
    const value = await this.#value;
    return value ? this.#toPromise(() => value.delete(key)) : null;
  }
  public index<K extends keyof Value>(name: K) {
    return new Index<Value, K>(this.#value, this.#thread, name as string);
  }
  #toPromise<T>(fn: () => IDBRequest<T>) {
    return this.#thread.run(() => idbRequestToPromise(fn));
  }
}
