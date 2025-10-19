export class PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        pageSize: number;
        totalItems: number;
        totalPages: number;
        hasNext: boolean;
        hasPrevious: boolean;
    };
}
