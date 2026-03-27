import type { OverrideComponentProps } from "@kobalte/core"
import { splitProps } from "solid-js"

export interface ProblemOptions {
  problem_id: string,
}

type ProblemProps = OverrideComponentProps<"div", ProblemOptions>

export function ProblemItem(props: ProblemProps) {
  const [local, other] = splitProps(props, ["problem_id"])

  return (
    <>
      <div {...other}>
        P{ local.problem_id }
      </div>
    </>
  )
}