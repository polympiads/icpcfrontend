import { Tooltip } from "@kobalte/core/tooltip";
import type { Account } from "../../worker/types/data/Users";
import { UnkownUser, UserPP } from "../user/UserPP";
import { BasePortal } from "../base/BasePortal";
import { UserInfo } from "./UserToolipInfo";
import { Show } from "solid-js";
import clsx from "clsx";

type AccountType = "team" | "judge"
const outline_map: Record<AccountType, string> = {
  "team": "outline outline-black/10",
  "judge": "outline-2 outline-purple-500"
}

export function UserTooltip(props: { user: Account | undefined }) {
  return (
    <>
      <Show when={ props.user != undefined }>
        <Tooltip>
          <Tooltip.Trigger class={ clsx("rounded-full overflow-hidden shrink-0 bg-white", outline_map[props.user!.type])}>
            <UserPP src={ undefined } variant="sm"/>
          </Tooltip.Trigger>
          <BasePortal>
            <Tooltip.Content class="border border-black/10 bg-white shadow-2xl rounded-md ui-expanded:animate-popover-enter ui-closed:animate-popover-exit popover-content z-999">
              <Tooltip.Arrow />
              <UserInfo user={props.user!} />
            </Tooltip.Content>
          </BasePortal>
        </Tooltip>
      </Show>
      <Show when={props.user == undefined}>
        <div class="outline outline-black/10 rounded-full overflow-hidden shrink-0 bg-white">
          <UnkownUser variant="sm"/>
        </div>
      </Show>
    </>
  )
}