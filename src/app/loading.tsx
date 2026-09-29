import { Loader2 } from 'lucide-react';

// Shown the instant a link is clicked, while the server renders the next
// page — without it the old page just sits there and the click feels dead.
export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center" role="status" aria-label="Loading">
      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
    </div>
  );
}
