import Index from "./ObjectStoreIndex";

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
  public value() {
    return this.#value;
  }
  public index<K extends keyof Value>(name: K) {
    return new Index<Value, K>(this.value(), name as string);
  }
}
