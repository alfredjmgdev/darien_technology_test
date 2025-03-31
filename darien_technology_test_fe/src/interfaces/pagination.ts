export interface PaginationData {
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}
