export class PaginatedResult<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
}
