
import { useAuth } from "../context/AuthContext";
import { useWorkerContext } from "../context/WorkerContext";
import { contestEndpoint } from "../Endpoints";
import { parseContest, type Contest, type ContestJson } from "../types/data/Contest";
import { createResource } from "solid-js";

export function useContestsPromise (): Promise<Contest[]> {
  const { apiHostname } = useWorkerContext();
  const { session } = useAuth();

  const sessionId = session();
  const headers: { [key: string]: string }
   = sessionId !== undefined
   ? { "X-Session-ID" : sessionId }
   : {};

  return fetch(
    new URL( contestEndpoint(), apiHostname ),
    { headers : headers }
  ).then( resp => resp.json() as Promise<ContestJson[]> )
   .then( resp => resp.map(parseContest) )
}
export function useContests (): () => Contest[] | undefined {
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
