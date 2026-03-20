import { createEffect, createMemo, createResource, onCleanup } from "solid-js";
import { useFeed } from "../context/FeedContext";
import { headerFromSession, useAuth } from "../context/AuthContext";
import { useWorkerContext } from "../context/WorkerContext";

export function useProblems () {
  const feed = useFeed();

  return createMemo(() => feed.problems)
}
export function useProblem (problemId: string) {
  const feed = useFeed();

  return () => feed.problems[problemId];
}

export function useStatement (problemId: string) {
  const problem = useProblem(problemId);
  const auth = useAuth();
  const { apiEndpoint } = useWorkerContext();

  createEffect(() => {
    console.log("NEW PROBLEM: ", problem())
  })

  const [statementBlob] = createResource(
    () => { return { problem: problem(), session: auth.session() } },
    async ({ problem, session }) => {
      console.log(problem, session)
      if (problem === undefined) {
        return undefined;
      }

      console.log("THE PROBLEM: ", problem)
      const response = await fetch(apiEndpoint(problem.statement[0].href), { headers: headerFromSession(session) })
      const blob = await response.blob();
      console.log("RECEIVED BLOB: ", blob)
      return blob;
    }
  );

  const [pdfUrl] = createResource<string | undefined, { blob: Blob | undefined }>(
    () => {
      return { blob: statementBlob() }
    },
    ({ blob }, { value: prevURL }) => {
      if (prevURL) {
        URL.revokeObjectURL(prevURL);
      }

      console.log("CREATE NEW URL");
      if (blob === undefined) {
        return undefined;
      }

      return URL.createObjectURL(blob);
    }
  )

  onCleanup(() => {
    const finalUrl = pdfUrl();
    if (finalUrl) {
      URL.revokeObjectURL(finalUrl);
    }
  });

  return pdfUrl;
}
