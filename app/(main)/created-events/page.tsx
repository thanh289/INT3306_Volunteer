// A protected page for event managers to see a list of events they created.


import { CreatedEventList } from '@/components/features/created-event-list';

export default function MyCreatedEventsPage() {
    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-8">Sự kiện tôi đã tạo</h1>
            <CreatedEventList />
        </div>
    );
}