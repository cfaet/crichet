export type Brand<A, Name extends string> = A & {
  readonly __brand: Name
}

export const brand = <A, Name extends string>(value: A): Brand<A, Name> =>
  value as Brand<A, Name>
