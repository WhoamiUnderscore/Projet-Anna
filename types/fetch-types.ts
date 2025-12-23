export type DataFetch<T> = {
  id: string,
  data: T | null,
  message: string | null,
  status: number | null
}
