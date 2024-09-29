export interface IResponse<T> {
  message: string | null | undefined;
  data: T | null | undefined;
  count: number | undefined;
}
