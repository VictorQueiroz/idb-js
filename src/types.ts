export type Key<T> = Brand<T, "key">;

export type Unique<T> = Brand<T, "unique">;

export type AutoIncrement<T> = Brand<T, "autoIncrement">;

export type Brand<T, U> = {
  value: T;
  brand: U;
};

export type RemoveBrand<T, U> = T extends Brand<T, U> ? T["value"] : T;
