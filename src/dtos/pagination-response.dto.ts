export class PaginationResponseDto<T> {
  items: T[];

  totalCount: number;

  page: number;

  take: number;

  pageCount: number;
}