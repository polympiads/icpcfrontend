import { Match } from "solid-js";
import { BaseEditor } from "../base/BaseEditor";
import type { Submission } from "../../worker/types/data/Submission";

import { AppButton } from "../AppButton";
import { OcLinkexternal2 } from "solid-icons/oc";
import { CopyButton } from "./CopyButton";
import { useUserLoginContext } from "../../contexts/UserLoginContext";
import { createResource } from "solid-js";
import { getSubmissionCode } from "../../utils/Submission";
import { useContest } from "../../worker/hooks/useContest";
import { LoadingAnimation } from "../animations/LoadingAnimation";
import { A } from "@solidjs/router"
import { SUBMISSION_URL } from "../../utils/Urls";
import { BaseSwitch } from "../base/BaseSwitch";
import { Switch } from "solid-js";
import { FaSolidWarning } from "solid-icons/fa";

import "./SubmissionEntries.css";
import { languageIdToPrismLanguage } from "../languages/Languages";
import { createEffect } from "solid-js";
import { AppEditor } from "../editor/AppEditor";

export function SubmissionCodeView(props: { submission: Submission }) {
  const { session } = useUserLoginContext()
  const contest = useContest()
  
  const resourceParams = () => ({ session: session(), contest: contest() })
  const [code] = createResource(resourceParams, async (params) => {
    if (!params.session || !params.contest)
      throw "Try to access session without session or contest providers"
  
    const response = await getSubmissionCode(
      params.session,
      params.contest,
      props.submission
    )
  
    return response
  })
  createEffect(() => {
    if (code.error) {
      console.error(code.error)
    }
  })
  
  return (
    <div class="h-full relative -top-2 rounded-b-md overflow-hidden z-0 border-x border-b border-slate-200 bg-white">
      <div class="h-2" />
      
        <BaseSwitch.FadeInAndOut pulseValue={ () => code.state } class="w-full" containerClass="relative w-full max-h-60 overflow-hidden">
          {(state) => (
            <Switch>
            <Match when={state == "ready"}>
              <div class="relative w-full max-h-60 overflow-hidden">
                <AppEditor code={ code() } language={ props.submission.language_id } readonly>
                  <div class="absolute right-0 z-10 p-2 gap-2 flex flex-row-reverse">
                    <CopyButton />
                    <A href={ SUBMISSION_URL(contest()!.id, props.submission.id) } target="_blank" rel="noopener noreferrer" >
                      <AppButton spacing="tiny" variant="white">
                        <OcLinkexternal2 size="1rem" />{" "}
                      </AppButton>
                    </A>
                  </div>
                  <div class="relative w-full z-0 max-h-60 overflow-auto">
                    <AppEditor.Editor />
                  </div>
                </AppEditor>
              </div>
              </Match>
              <Match when={state == "pending" || state == "refreshing" || state == "unresolved"}>
                <div class="w-full h-20 flex items-center justify-center">
                  <LoadingAnimation.SpinningCircle size="3rem" />
                </div>
              </Match>
              <Match when={state == "errored"}>
                <div class="w-full h-20 flex items-center justify-center">
                  <FaSolidWarning size="3rem" class="opacity-50"/>
                </div>
              </Match>
            </Switch>
          )}
        </BaseSwitch.FadeInAndOut>
    </div>
  )
}