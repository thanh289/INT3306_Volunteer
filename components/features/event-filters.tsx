// A client component that provides UI for filtering and sorting events.
// Not directly fecth the data, just update the URL for parent component

'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export const EventFilters = () => {
    const router = useRouter();
    const pathname = usePathname(); // get the current URL
    const searchParams = useSearchParams(); // get params in the URL (query string)

    const handleFilterChange = (
        e: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        const currentParams = new URLSearchParams(Array.from(searchParams.entries()));

        if (value) {
            currentParams.set(name, value);
        } else {
            currentParams.delete(name); // Delete filter if user choose "Tất cả"
        }

        // Update the URL
        router.push(`${pathname}?${currentParams.toString()}`);
    };

    return (
        <div className="mb-8 p-4 bg-gray-100 rounded-lg flex flex-col md:flex-row gap-4">
            {/* Filter by category */}
            <div className="flex-1">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Danh mục
                </label>
                <select
                    id="category"
                    name="category"
                    onChange={handleFilterChange}
                    // Lấy giá trị hiện tại từ URL để hiển thị
                    defaultValue={searchParams.get('category') || ''}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                >
                    {/* set no value for "Tất cả" */}
                    <option value="">Tất cả</option>
                    <option value="ENVIRONMENT">Môi trường</option>
                    <option value="EDUCATION">Giáo dục</option>
                    <option value="HEALTHCARE">Y tế - Sức khỏe</option>
                    <option value="COMMUNITY">Cộng đồng</option>
                </select>
            </div>

            {/* Sort by date/name */}
            <div className="flex-1">
                <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700">
                    Sắp xếp theo
                </label>
                <select
                    id="sortBy"
                    name="sortBy"
                    onChange={handleFilterChange}
                    defaultValue={searchParams.get('sortBy') || 'startDateTime'}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                >
                    <option value="startDateTime">Ngày bắt đầu</option>
                    <option value="title">Tên (A-Z)</option>
                </select>
            </div>
        </div>
    );
};