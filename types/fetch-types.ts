export type DataFetch<T> = {
  data: T,
  message: string,
  status: number
}

export type FetchError = {
  message: string,
  status: number
}
