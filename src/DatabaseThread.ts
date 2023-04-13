export interface IDatabaseThread {
  run<R>(fn: () => Promise<R>): Promise<R>;
}

export default class DatabaseThread implements IDatabaseThread {
  #pending = Promise.resolve();
  public run<R>(fn: () => Promise<R>): Promise<R> {
    const promise = this.#pending.then(() => fn());
    this.#pending = promise
      .then(() => {})
      .catch((reason) => {
        console.error(
          "uncaught exception on function added to DatabaseThread: %o",
          reason
        );
      });
    return promise;
  }
}
