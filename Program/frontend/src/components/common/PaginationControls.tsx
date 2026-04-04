import "../../stylesheets/PaginationControls.css";

type PaginationControlsProps = {
    page: number;
    totalPages: number;
    pageSize: number;
    loading?: boolean;
    pageSizeOptions?: number[];
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
};

export default function PaginationControls({
    page,
    totalPages,
    pageSize,
    loading = false,
    pageSizeOptions = [25, 50, 100],
    onPageChange,
    onPageSizeChange,
}: PaginationControlsProps) {
    const pageNumber = page + 1;
    const canGoPrevious = pageNumber > 1;
    const canGoNext = pageNumber < Math.max(totalPages, 1);

    const pages = buildPages(pageNumber, totalPages);

    return (
        <div className="paginationControls">
            <div className="paginationControlsActions">
                <button
                    type="button"
                    className="paginationControlsNavButton"
                    onClick={() => onPageChange(page - 1)}
                    disabled={loading || !canGoPrevious}
                    aria-label="Previous page"
                >
                    <span aria-hidden="true">&#8249;</span>
                </button>
                <div className="paginationControlsPages" aria-label="Pagination">
                    {pages.map((entry, index) =>
                        entry === "ellipsis" ? (
                            <span key={`ellipsis-${index}`} className="paginationControlsEllipsis" aria-hidden="true">
                                ...
                            </span>
                        ) : (
                            <button
                                key={entry}
                                type="button"
                                className={
                                    entry === pageNumber
                                        ? "paginationControlsPageButton paginationControlsPageButton--active"
                                        : "paginationControlsPageButton"
                                }
                                onClick={() => onPageChange(entry - 1)}
                                disabled={loading}
                                aria-current={entry === pageNumber ? "page" : undefined}
                            >
                                {entry}
                            </button>
                        )
                    )}
                </div>
                <button
                    type="button"
                    className="paginationControlsNavButton"
                    onClick={() => onPageChange(page + 1)}
                    disabled={loading || !canGoNext}
                    aria-label="Next page"
                >
                    <span aria-hidden="true">&#8250;</span>
                </button>
                <label className="paginationControlsPageSize">
                    <span>Results per page:</span>
                    <select
                        value={pageSize}
                        onChange={(event) => onPageSizeChange(Number(event.target.value))}
                        disabled={loading}
                    >
                        {pageSizeOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </label>
            </div>
        </div>
    );
}

function buildPages(currentPage: number, totalPages: number): Array<number | "ellipsis"> {
    if (totalPages <= 1) {
        return [1];
    }

    if (totalPages <= 5) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (currentPage <= 3) {
        return [1, 2, 3, "ellipsis", totalPages];
    }

    if (currentPage >= totalPages - 2) {
        return [1, "ellipsis", totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages];
}
