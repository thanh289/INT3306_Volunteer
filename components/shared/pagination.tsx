// Reusable pagination component
// components/shared/pagination.tsx

'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

type PaginationProps = {
    currentPage: number;
    totalPages: number;
    baseUrl: string;
};

export const Pagination = ({ currentPage, totalPages, baseUrl }: PaginationProps) => {
    const searchParams = useSearchParams();

    // Helper to build URL with current filters
    const buildUrl = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', page.toString());
        return `${baseUrl}?${params.toString()}`;
    };

    // Generate page numbers to show
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 5; // Max page buttons to show

        if (totalPages <= maxVisible) {
            // Show all pages if total is small
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            if (currentPage > 3) {
                pages.push('...');
            }

            // Show pages around current page
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (currentPage < totalPages - 2) {
                pages.push('...');
            }

            // Always show last page
            pages.push(totalPages);
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className="flex justify-center">
            <div className="flex items-center gap-2">
                {/* Previous Button */}
                <Link
                    href={currentPage > 1 ? buildUrl(currentPage - 1) : '#'}
                    className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 ${currentPage <= 1
                        ? 'bg-base-200 text-base-content/40 cursor-not-allowed'
                        : 'bg-base-200 hover:bg-base-300 text-base-content'
                        }`}
                    aria-disabled={currentPage <= 1}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>

                {/* Page Numbers */}
                {pageNumbers.map((page, index) => {
                    if (page === '...') {
                        return (
                            <span key={`ellipsis-${index}`} className="flex items-center justify-center w-10 h-10 text-base-content/60">
                                ...
                            </span>
                        );
                    }

                    const pageNum = page as number;
                    const isActive = pageNum === currentPage;

                    return (
                        <Link
                            key={pageNum}
                            href={buildUrl(pageNum)}
                            className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-all duration-200 ${isActive
                                ? 'bg-primary text-primary-content border-2 border-primary'
                                : 'bg-base-200 hover:bg-base-300 text-base-content border-2 border-transparent'
                                }`}
                        >
                            {pageNum}
                        </Link>
                    );
                })}

                {/* Next Button */}
                <Link
                    href={currentPage < totalPages ? buildUrl(currentPage + 1) : '#'}
                    className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 ${currentPage >= totalPages
                        ? 'bg-base-200 text-base-content/40 cursor-not-allowed'
                        : 'bg-base-200 hover:bg-base-300 text-base-content'
                        }`}
                    aria-disabled={currentPage >= totalPages}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
            </div>
        </div>
    );
};