import { Transition } from "solid-transition-group"
import type { JudgementType } from "../../worker/types/data/JudgementTypes"
import type { Submission } from "../../worker/types/data/Submission"
import { BaseSwitch, type SwitchProperties } from "../base/BaseSwitch"
import { Match, Show } from "solid-js"
import { Switch } from "solid-js"
import { LoadingAnimation } from "../animations/LoadingAnimation"
import { Check, X } from "lucide-solid"
import { VsWarning } from "solid-icons/vs"
import type { Accessor } from "solid-js"

export type Status = "waiting" | "running" | "reject" | "failed" | "accepted"

export function computeStatus(submission: Submission, judgment: JudgementType | undefined): Status {
  switch (submission.status) {
    case "starting":
      return "waiting"
    case "compiling":
    case "running":
      return "running"
    case "finished":
      if (judgment) {
        if (judgment.solved) {
          return "accepted"
        } else {
          return "reject"
        }
      }
      return "running"
    case "failed":
      return "failed"
  }
}

export function StatusIconTransition<T>(props: SwitchProperties<T>) {
  return (
    <>
      <BaseSwitch
        class="flex"
        transitionComponent={(props) => (
          <Transition
            enterActiveClass="statusEnterAnimation"
            exitActiveClass="statusExitAnimation"
          >
            <Show when={props.visible}>
              { props.children }
            </Show>
          </Transition>
        )}
        {...props}
      />
    </>
  )
}

export function SubmissionStatusIcon(props: { status: Status, judgment: Accessor<JudgementType | undefined> }) {
  return (
    <>
      <Switch>
        <Match when={props.status == "running"}>
          <LoadingAnimation.SpinningCircle size="1.5rem"/>
        </Match>
        <Match when={props.status == "accepted"}>
          <Check class="stroke-green-500"/>
        </Match>
        <Match when={props.status == "reject"}>
          <div class="flex flex-row w-fit h-full items-center text-red-500 justify-center" >
            <X />
          </div>
        </Match>
        <Match when={props.status == "failed"}>
          <VsWarning class="stroke-red-500" />
        </Match>
      </Switch>
    </>
  )
}
