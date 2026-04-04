export type PaginatedResponse<T> = {
    items: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
};

export type PageRequest = {
    page: number;
    size?: number;
};

export type SortedPageRequest = PageRequest & {
    sortKey?: string;
    sortDirection?: "asc" | "desc";
};
