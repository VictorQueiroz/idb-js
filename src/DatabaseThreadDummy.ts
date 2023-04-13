import { IDatabaseThread } from "./DatabaseThread";

export default class DatabaseThreadDummy implements IDatabaseThread {
  public run<R>(fn: () => Promise<R>): Promise<R> {
    return fn();
  }
}
