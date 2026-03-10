import { createMemo } from "solid-js";
import { useFeed } from "../context/FeedContext";

export function useSubmissions () {
  const feed = useFeed();

  return createMemo(() => feed.submissions);
}
export function useSubmission (submissionId: string) {
  const feed = useFeed();

  return createMemo(() => feed.submissions[submissionId]);
}
