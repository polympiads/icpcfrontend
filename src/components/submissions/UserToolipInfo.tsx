import { Show } from "solid-js";
import { UserPP } from "../user/UserPP";
import type { Account } from "../../worker/types/data/Users";
import { UserRole } from "../user/UserRole";

export function UserInfo(props: { user: Account }) {
  return (
    <>
      <div class="max-w-80 p-3">
        <div class="flex flex-row items-center-safe">
          <div class="outline outline-black/10 rounded-full overflow-hidden shrink-0">
            <UserPP src={undefined} variant="sm"/>
          </div>

          <div class="flex flex-col ml-2">
            <div class="text-lg wrap-anywhere">
              { props.user.username }
              <Show when={props.user.type == "judge"}>
                <span class="ml-1">
                  <UserRole.Judge />
                </span>
              </Show>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
