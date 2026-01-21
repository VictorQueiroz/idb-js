import Cursor from "./Cursor";
import { IDatabaseThread } from "./DatabaseThread";
import DeferredTransaction, {
  IOpenTransactionInfo,
} from "./DeferredTransaction";
import Index from "./ObjectStoreIndex";
import idbRequestToPromise from "./idbRequestToPromise";

export default class ObjectStore<Value> extends DeferredTransaction {
  readonly #thread;
  readonly #openTransactionInfo;
  readonly #database;
  readonly #objectStoreName;
  public constructor(
    database: Promise<IDBDatabase | null>,
    openTransactionInfo: IOpenTransactionInfo,
    thread: IDatabaseThread,
    objectStoreName: string
  ) {
    super(database, openTransactionInfo, thread, objectStoreName);
    this.#thread = thread;
    this.#objectStoreName = objectStoreName;
    this.#database = database;
    this.#openTransactionInfo = openTransactionInfo;
  }
  public async put(value: Value, key?: IDBValidKey) {
    return this.openTransaction((objectStore) =>
      idbRequestToPromise(() => objectStore.put(value, key))
    );
  }
  public async getAll(
    query?: IDBValidKey | IDBKeyRange | null,
    count?: number
  ) {
    return this.openTransaction((objectStore) =>
      idbRequestToPromise<Value[]>(() => objectStore.getAll(query, count))
    );
  }
  public async get(query: IDBValidKey | IDBKeyRange) {
    return this.openTransaction((objectStore) =>
      idbRequestToPromise<Value>(() => objectStore.get(query))
    );
  }
  public openKeyCursor(
    query?: IDBValidKey | IDBKeyRange | null,
    direction?: IDBCursorDirection
  ) {
    return this.openTransaction((objectStore) =>
      objectStore.openKeyCursor(query, direction)
    );
  }
  public async openCursor(
    query?: IDBValidKey | IDBKeyRange | null,
    direction?: IDBCursorDirection
  ) {
    return this.openTransaction((objectStore) =>
      objectStore.openCursor(query, direction)
    );
  }
  public async openCursorIter(
    query?: IDBValidKey | IDBKeyRange | null,
    direction?: IDBCursorDirection
  ) {
    return this.openTransaction((objectStore) => {
      return new Cursor<Value>(objectStore, query, direction);
    });
  }
  public async delete(key: IDBValidKey | IDBKeyRange) {
    return this.openTransaction((store) =>
      idbRequestToPromise(() => store.delete(key))
    );
  }
  public index<K extends keyof Value>(name: K) {
    return new Index<Value, K>(
      this.#database,
      this.#openTransactionInfo,
      this.#thread,
      this.#objectStoreName,
      name as string
    );
  }
}
