import DatabaseThread from "./DatabaseThread";
import DeferredTransaction, {
  IOpenTransactionInfo,
} from "./DeferredTransaction";
import idbRequestToPromise from "./idbRequestToPromise";

export default class ObjectStoreIndex<
  Value,
  K extends keyof Value
> extends DeferredTransaction {
  readonly #indexName;
  public constructor(
    database: Promise<IDBDatabase | null>,
    openTransactionInfo: IOpenTransactionInfo,
    thread: DatabaseThread,
    objectStoreName: string,
    indexName: string
  ) {
    super(database, openTransactionInfo, thread, objectStoreName);
    this.#indexName = indexName;
  }
  public async get(value: Value[K]) {
    return this.openTransaction((store) =>
      idbRequestToPromise<Value>(() =>
        store.index(this.#indexName).get(value as IDBValidKey)
      )
    );
  }
}
