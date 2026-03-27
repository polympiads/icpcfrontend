import { createMemo, Show, type Accessor } from "solid-js";
import { LanguageIcon } from "../editor/LanguageIcon";
import { ProblemItem } from "./ProblemEntry";
import { BaseSwitch } from "../base/BaseSwitch";
import "./SubmissionEntry.css"
import { Match, Switch } from "solid-js";
import type { Submission } from "../../worker/types/data/Submission";
import { useAccounts, useTeams } from "../../worker/hooks/useUsers";
import { UserTooltip } from "./UserTooltip";
import TextScroller from "../animations/TextAnimation";
import { TeamPP, UnkownTeam } from "../user/TeamPP";
import { useJudgementTypes } from "../../worker/hooks/useJudgementTypes";
import { computeStatus, StatusIconTransition, SubmissionStatusIcon, type Status } from "./SubmissionStatus";
import { createEffect } from "solid-js";

type Variant = "user" | "team" | "none"

function UserInfo(props: { account_id: string | undefined }) {
  const accounts = useAccounts()
  //createEffect(()=> console.log(accounts()))
  const account = createMemo(() => props.account_id ? accounts()[props.account_id!] : undefined)
  //createEffect(() => console.log(account()))
  
  return (
    <>
      <UserTooltip user={account()} />
    </>
  )
}

function TeamInfo(props: { team_id: string | undefined }) {
  const teams = useTeams()
  const team = createMemo(() => props.team_id ? teams()[props.team_id!] : undefined)
  
  return (
    <>
      <div class="outline outline-black/10 rounded-md overflow-hidden shrink-0 bg-white">
        <Show when={ team() != undefined }>
          <TeamPP src={ undefined } variant="sm"/>
        </Show>
        <Show when={ team() == undefined}>
          <div class="outline outline-black/10 rounded-md overflow-hidden shrink-0 bg-white">
            <UnkownTeam variant="sm"/>
          </div>
        </Show>
      </div>
      
      <TextScroller hoverOnly>
        { team()?.name ?? "[Unknown team]" }
      </TextScroller>
    </>
  )
}

export function SubmissionEntry(props: { index: number, submission: Submission, variant: Variant }) {
  const judgments = useJudgementTypes()
  const judgment = createMemo(() => props.submission.judgement_type_id ? judgments()[props.submission.judgement_type_id] : undefined)
  
  const status = createMemo(() => computeStatus(props.submission, judgment()))
  //createEffect(() => console.log(status()))
  
  return (
    <>
      {/*<button onClick={() => setSubmission("status", "starting")}> [ Starting ]</button>
      <button onClick={() => setSubmission("status", "compiling")}> [ Compiling ]</button>
      <button onClick={() => setSubmission("status", "running")}> [ Running ]</button>
      <button onClick={() => setSubmission("status", "finished")}> [ Finished ]</button>
      <button onClick={() => setSubmission("status", "failed")}> [ Failed ]</button>*/}
      <div class="relative h-12 w-full group @container/submissionEntry">
        <div class="absolute w-full h-full z-0">
          <Background status={ status } />
        </div>
        <div class="relative h-full flex flex-row *:not-last:mr-2 items-center bg-linear-to-r px-3 py-1 rounded-md duration-150 transition-all cursor-pointer border border-black/10 z-10">
          <div class="text-gray-400"> {`#${props.index}`} </div>
          <ProblemItem problem_id={props.submission.problem_id} class="text-xl font-normal"/>
          <LanguageIcon language={props.submission.language_id} class="p-1" />
          
          <div class="h-full flex flex-row *:not-last:mr-2 items-center @max-3xs/submissionEntry:hidden shrink overflow-x-hidden">
            <Switch>
              <Match when={props.variant == "user"}>
                { /* Separator */ }
                <div class="h-4/5 w-px bg-black/10"></div>
                
                <UserInfo account_id={props.submission.account_id}/>
              </Match>
              <Match when={props.variant == "team"}>
                { /* Separator */ }
                <div class="h-4/5 w-px bg-black/10"></div>
                
                <TeamInfo team_id={props.submission.team_id}/>
              </Match>
            </Switch>
          </div>
          
          { /* Space */ }
          <div class="grow" />
          
          <div class="shrink-0 flex flex-row items-center">
            <StatusIconTransition pulseValue={status}>
              {(value) => (
                <>
                <SubmissionStatusIcon status={value} judgment={judgment} />
                </>
              )}
            </StatusIconTransition>
            
            <BaseSwitch.FadeInAndOut pulseValue={status}>
              {(value) => (
                <>
                  <Show when={ value == "reject" && judgment() != undefined }>
                    <div class="overflow-hidden font-mono leading-none text-red-500 w-8 text-center">
                      { judgment()?.id }
                    </div>
                  </Show>
                </>
              )}
            </BaseSwitch.FadeInAndOut>
          </div>
        </div>
      </div>
    </>
  )
}

function Background(props: { status: Accessor<Status> }) {
  const bg_map: Record<Status, string> = {
    "accepted": "bg-linear-to-r from-green-50 to-green-200 hover:from-green-200 hover:to-green-300",
    "failed": "bg-linear-to-r from-red-50 to-red-200 hover:from-red-200 hover:to-red-300",
    "reject": "bg-linear-to-r from-red-50 to-red-200 hover:from-red-200 hover:to-red-300",
    "running": "bg-linear-to-r from-gray-50 to-gray-200 hover:from-gray-200 hover:to-gray-300",
    "waiting": "bg-linear-to-r from-gray-50 to-gray-100 hover:from-gray-200 hover:to-gray-300",
  }
  
  return (
    <>
      <BaseSwitch.FadeInAndOut
        class="w-full h-full"
        containerClass="h-full w-full"
        pulseValue={props.status}>
        {(status) => (
          <>
            <div class={ "w-full h-full " + bg_map[status] } />
          </>
        )}
      </BaseSwitch.FadeInAndOut>
    </>
  )
}

