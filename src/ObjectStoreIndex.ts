import idbRequestToPromise from "./idbRequestToPromise";

export default class ObjectStoreIndex<Value, K extends keyof Value> {
  readonly #value;
  public constructor(
    objectStore: Promise<IDBObjectStore | null>,
    name: string
  ) {
    this.#value = objectStore.then((objectStore) =>
      objectStore ? objectStore.index(name) : null
    );
  }
  public value() {
    return this.#value;
  }
  public async get(value: Value[K]) {
    let index: IDBIndex | null;
    try {
      index = await this.#value;
      if (!index) {
        throw new Error("promise returned null");
      }
    } catch (reason) {
      console.error(
        "object store promise failed to be resolved with error: %o",
        reason
      );
      return null;
    }
    const indexValue = index;
    return indexValue
      ? idbRequestToPromise<Value>(() => indexValue.get(value as IDBValidKey))
      : null;
  }
}
