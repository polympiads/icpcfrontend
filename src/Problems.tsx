import { Button } from "@kobalte/core/button";
import { RotateCw } from "lucide-solid";
import { BsExclamationCircle } from "solid-icons/bs";
import type { Accessor } from "solid-js";
import { PDFViewer } from "../packages/pdfslick/src";
import { LoadingAnimation } from "./LoadingAnimation";
import { useStatement } from "./worker/hooks/useProblems";
import type { Submission } from "./worker/types/data/Submission";
import { sortRecordValues } from "./utils";
import type { JudgementType } from "./worker/types/data/JudgementTypes";

export function ProblemViewer(props: { problemId: Accessor<string> }) {
  const [statement, statementActions] = useStatement(props.problemId);

  return (
    <PDFViewer
      pdfSource={statement}
      class="relative w-full h-full inset-0 pdfSlick flex flex-col"
    >
      <PDFViewer.Toolbar>
        <PDFViewer.Toolbar.ThumbsbarButton />
        <PDFViewer.Toolbar.Splitter />
        <PDFViewer.Toolbar.ZoomSelector />
        <PDFViewer.Toolbar.Splitter />
        <PDFViewer.Toolbar.PageSelector />
      </PDFViewer.Toolbar>
      <div class="flex-1 relative h-full [&_.canvasWrapper]:shadow-md [&_.canvasWrapper]:outline [&_.canvasWrapper]:outline-black/10 [&_.viewerContainer]:z-0">
        <PDFViewer.Thumbsbar />
        <PDFViewer.Viewer />
      </div>
      <PDFViewer.Loading>
        <div class="absolute w-full h-full backdrop-blur-md flex flex-col justify-center items-center z-10">
          <LoadingAnimation.SpinningCircle size="4em" />
          <div class="text-2xl font-medium text-center">
            Waiting for problem...
          </div>
        </div>
      </PDFViewer.Loading>
      <PDFViewer.Error>
        <div class="absolute w-full h-full flex flex-col items-center justify-center z-10">
          <BsExclamationCircle size="3em" />
          <div class="text-xl font-medium mb-3"> Something went wrong. </div>
          <Button
            class="border border-black/10 p-2 rounded-md flex flex-row items-center hover:bg-gray-100"
            onClick={() => statementActions.refetch()}
          >
            <RotateCw size="1em" /> <div class="ml-1">Retry</div>
          </Button>
        </div>
      </PDFViewer.Error>
    </PDFViewer>
  );
}

export type ProblemStatus = {
  solved: boolean,
  failed_count: number,
  penalty_count: number
}

type ProblemStatusForUser = Record<string, ProblemStatus>
type ProblemStatusForAllUser = Record<string, ProblemStatusForUser>

export function computeProblemStatusForAllUser(
  submissions: Record<string, Submission>, 
  judgement_types: Record<string, JudgementType>
): ProblemStatusForAllUser {
  const sortedSubmissions = sortRecordValues(submissions, (v) => v.id)

  let user_map: Record<string, ProblemStatusForUser> = {}
  for(const submission of sortedSubmissions) {
    const user_id = submission.account_id
    if (user_id === undefined) {
      continue;
    }
    const problem_id = submission.problem_id;

    if (!(user_id in user_map)) {
      user_map[user_id] = {}
    }
    if (!(problem_id in user_map[user_id])) {
      user_map[user_id][problem_id] = { failed_count: 0, solved: false, penalty_count: 0 }
    } else if (user_map[user_id][problem_id].solved) {
      continue;
    }

    const judgement_type_id = submission.judgement_type_id;
    if (judgement_type_id === undefined) {
      continue;
    }

    if (!(judgement_type_id in judgement_types)) {
      continue;
    }
    const judgement_type = judgement_types[judgement_type_id]
    
    if (judgement_type.solved) {
      user_map[user_id][problem_id].solved = true
    } else {
      user_map[user_id][problem_id].failed_count += 1;
    }

    if (judgement_type.penalty) {
      user_map[user_id][problem_id].penalty_count += 1
    }
  }

  return user_map
}
