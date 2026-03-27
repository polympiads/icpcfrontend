import { AppPanel, AppSplitPanel } from "../components/AppSplitPanel";
import { BasePortalRoot } from "../components/base/BasePortal";
import { useParams } from "../components/base/BaseRoute";
import { SubmissionEditor } from "../components/editor/SubmissionEditor";
import { AppDefaultLayout } from "../components/layout/AppDefaultLayout";
import { SubmissionEntries } from "../components/submissions/SubmissionEntries";
import { UserInfoWidget } from "../widgets/UserInfoWidget";
import { FeedProvider } from "../worker/context/FeedContext";
import { createMemo } from "solid-js";
import { useSubmissions } from "../worker/hooks/useSubmissions";
import { useLanguages } from "../worker/hooks/useLanguages";
import { postSubmission } from "../utils/Submission";
import { useAuth } from "../worker/context/AuthContext";
import { ProblemViewer } from "../components/prolblem/ProblemViewer";

function _InContestView() {
  const params = useParams();
  const contest_id = params.id!;

  const submissions = useSubmissions();
  const languages = useLanguages();
  const languageIds = createMemo(() => Object.keys(languages()));

  const auth = useAuth();

  const problem_id = () => "1";

  async function submitCode(code: string, language_id: string) {
    await postSubmission(
      contest_id,
      code,
      problem_id(),
      language_id,
      auth.session()!,
    );
  }

  return (
    <AppDefaultLayout
      headerComponents={
        <>
          {/* Space */}
          <div class="grow" />

          <UserInfoWidget />
        </>
      }
    >
      <BasePortalRoot>
        <AppSplitPanel
          class="h-full"
          sizes={[60, 50]}
          minSize={230}
          includeMargin
        >
          <AppPanel>
            <ProblemViewer problemId="1" />
          </AppPanel>
          <AppSplitPanel direction="vertical" sizes={[80, 80]}>
            <AppPanel>
              <div class="h-full w-full flex flex-col">
                <SubmissionEntries submissions={submissions} />
              </div>
            </AppPanel>
            <AppPanel>
              <SubmissionEditor
                availableLanguages={languageIds}
                onSubmit={submitCode}
                disableSubmission={auth.session() == undefined}
              />
            </AppPanel>
          </AppSplitPanel>
        </AppSplitPanel>
      </BasePortalRoot>
    </AppDefaultLayout>
  );
}

export function InContestView() {
  const params = useParams();

  return (
    <>
      <FeedProvider contestId={params.id!}>
        <_InContestView />
      </FeedProvider>
    </>
  );
}
