import Index from "./ObjectStoreIndex";
import idbRequestToPromise from "./idbRequestToPromise";

export default class ObjectStore<Value, ObjectStoreNames> {
  readonly #value;
  public constructor(
    transaction: Promise<IDBTransaction | null>,
    name: ObjectStoreNames
  ) {
    this.#value = transaction.then((transaction) =>
      transaction ? transaction.objectStore(name as string) : null
    );
  }
  public async put(value: Value) {
    const objectStore = await this.#value;
    if (objectStore === null) return null;
    return idbRequestToPromise(() => objectStore.put(value));
  }
  public async getAll(
    query?: IDBValidKey | IDBKeyRange | null,
    count?: number
  ) {
    const objectStore = await this.#value;
    if (objectStore === null) return null;
    return idbRequestToPromise<Value[]>(() => objectStore.getAll(query, count));
  }
  public async get(query: IDBValidKey | IDBKeyRange) {
    const objectStore = await this.#value;
    if (objectStore === null) return null;
    return idbRequestToPromise<Value>(() => objectStore.get(query));
  }
  public async openCursor(
    query?: IDBValidKey | IDBKeyRange | null,
    direction?: IDBCursorDirection
  ): Promise<IDBRequest<IDBCursorWithValue | null> | null> {
    return (await this.#value)?.openCursor(query, direction) ?? null;
  }
  public async delete(key: IDBValidKey | IDBKeyRange) {
    const value = await this.#value;
    return value ? idbRequestToPromise(() => value.delete(key)) : null;
  }
  public index<K extends keyof Value>(name: K) {
    return new Index<Value, K>(this.#value, name as string);
  }
}
