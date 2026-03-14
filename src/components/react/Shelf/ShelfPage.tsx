import { useReadingStatus } from "@/hooks/use-reading-status";
import { EmptyShelf } from "./EmptyShelf";

export default function ShelfPage() {
  const { statusMap } = useReadingStatus();

  const entries = Object.entries(statusMap).filter(
    ([, status]) => status !== "none",
  );

  if (entries.length === 0) {
    return <EmptyShelf />;
  }

  // TODO: implement shelf with book spines
  return <EmptyShelf />;
}
