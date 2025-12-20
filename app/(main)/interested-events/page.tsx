// Page for displaying interested events (favorites)
// app/(main)/interested-events/page.tsx

import { InterestedEventList } from "@/components/features/interested-event-list";

export default function InterestedEventsPage() {
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
          Sự kiện quan tâm
        </h1>
        <p className="text-base-content/60 mt-2">
          Các sự kiện bạn đã đánh dấu yêu thích
        </p>
      </div>
      <InterestedEventList />
    </div>
  );
}
