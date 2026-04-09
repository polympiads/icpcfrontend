import { createMemo } from "solid-js";
import { useFeed } from "../context/FeedContext";
import { submissionEquals, submissionListEquals } from "../types/data/Submission";

export function useSubmissions () {
  const feed = useFeed();

  return createMemo(() => {
    return feed().submissions
  }, undefined, {
    equals: submissionListEquals
  });
}
export function useSubmission (submissionId: string) {
  const feed = useFeed();

  return createMemo(() => {
    return feed().submissions[submissionId]
  }, undefined, {
    equals: submissionEquals
  });
}
