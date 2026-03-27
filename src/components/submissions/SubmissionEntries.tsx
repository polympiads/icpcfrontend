import { Accordion } from "@kobalte/core/accordion";
import {
  type Accessor,
  type ComponentProps,
  createMemo,
  Match,
} from "solid-js";
import { SubmissionEntry } from "./SubmissionEntry";
import clsx from "clsx";
import { BaseEditor } from "../base/BaseEditor";
import type { Submission } from "../../worker/types/data/Submission";
import { List } from "@solid-primitives/list";
import { TransitionGroup } from "solid-transition-group";

import { AppButton } from "../AppButton";
import { OcLinkexternal2 } from "solid-icons/oc";
import { CopyButton } from "./CopyButton";
import { sortRecordValues } from "../../utils/RecordUtils";
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
import { languageIdToPrismLanguage } from "../editor/Languages";
import { SubmissionCodeView } from "./SubmissionCodeView";


function SubmissionEntryWithCode(props: { submission: Accessor<Submission>, index: Accessor<number> }) {
  const { is_authenticated, user_info } = useUserLoginContext()
  
  const canAccessCode = createMemo(() => {
    if (!is_authenticated()) {
      return false
    }
    
    return user_info()?.is_staff || user_info()?.id == props.submission().account_id
  })
  
  return (
    <>
      <Accordion.Item value={props.submission().id} disabled={ !canAccessCode() }>
        <Accordion.Header class="relative z-10">
          <Accordion.Trigger class="w-full rounded-md group">
            <SubmissionEntry
              index={props.index() + 1}
              submission={props.submission()}
              variant="user"
            />
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content class="ui-closed:animate-slide-up">
          <SubmissionCodeView submission={props.submission()}/>
        </Accordion.Content>
      </Accordion.Item>
    </>
  )
}

export function SubmissionEntries(
  props: ComponentProps<"div"> & {
    submissions: Accessor<Record<string, Submission>>;
  },
) {
  const sortedSubmissions = createMemo(() =>
    sortRecordValues(props.submissions(), (v) => Number(v.id), "desc"),
  );
  //console.log(sortedSubmissions());

  const finalStyle = clsx(
    "overflow-x-hidden p-3 *:not-last:mb-3 overflow-auto grow",
    props.class,
  );

  return (
    <>
      <Accordion class={finalStyle} collapsible={true}>
        <TransitionGroup
          enterActiveClass="entryEnterAnimation"
          exitActiveClass="animate-fade-out"
        >
          <List each={sortedSubmissions()}>
            {(item, index) => (
              <SubmissionEntryWithCode submission={item} index={() => sortedSubmissions().length - index()} />
            )}
          </List>
        </TransitionGroup>
      </Accordion>
    </>
  );
}
