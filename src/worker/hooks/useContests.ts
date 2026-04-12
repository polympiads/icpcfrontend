import { createResource, type Resource, type ResourceActions } from "solid-js";
import { useAuth } from "../context/AuthContext";
import { useWorkerContext } from "../context/WorkerContext";
import { contestEndpoint } from "../Endpoints";
import {
  type Contest,
  type ContestJson,
  parseContest,
} from "../types/data/Contest";

type ContestValue = {
  contests: Resource<Contest[]>;
  contestsActions: ResourceActions<Contest[] | undefined, unknown>;
};

export function useContests(): ContestValue {
  const { apiHostname } = useWorkerContext();
  const { session } = useAuth();

  const [resource, resourceActions] = createResource(
    () => ({
      sessionId: session(),
    }),
    async ({ sessionId }) => {
      const headers: { [key: string]: string } =
        sessionId !== undefined ? { "X-Session-ID": sessionId } : {};

      const response = await fetch(new URL(contestEndpoint(), apiHostname), {
        headers: headers,
      });

      const json: ContestJson[] = await response.json();

      return json.map(parseContest);
    },
  );

  return { contests: resource, contestsActions: resourceActions };
}
