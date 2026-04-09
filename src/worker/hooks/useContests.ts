
import { useAuth } from "../context/AuthContext";
import { useWorkerContext } from "../context/WorkerContext";
import { contestEndpoint } from "../Endpoints";
import { parseContest, type Contest, type ContestJson } from "../types/data/Contest";
import { createResource, type Resource } from "solid-js";

export function useContests (): Resource<Contest[]> {
  const { apiHostname } = useWorkerContext();
  const { session } = useAuth();

  const [resource] = createResource(
    () => ({
      sessionId: session()
    }),
    async ({ sessionId }) => {
      const headers: { [key: string]: string }
        = sessionId !== undefined
        ? { "X-Session-ID" : sessionId }
        : {};

      const response = await fetch(
        new URL( contestEndpoint(), apiHostname ),
        { headers : headers }
      )

      const json: ContestJson[] = await response.json()

      return json.map(parseContest);
    })

  return resource
}
