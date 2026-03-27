import { BasePortalRoot } from "../components/base/BasePortal"
import { useParams } from "../components/base/BaseRoute"
import { AppDefaultLayout } from "../components/layout/AppDefaultLayout"
import { SubmissionCodeView } from "../components/submissions/SubmissionCodeView"
import { UserInfoWidget } from "../widgets/UserInfoWidget"
import { FeedProvider } from "../worker/context/FeedContext"
import { useSubmission } from "../worker/hooks/useSubmissions"

function _SubmissionView() {
  const urlParams = useParams()
  const submission = useSubmission(urlParams.submission_id!)
  
  return (
    <>
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
          <Show when={submission()}>
            <SubmissionCodeView submission={ submission() }/>
          </Show>
        </BasePortalRoot>
      </AppDefaultLayout>
    </>
  )
}

export function SubmissionView() {
  const params = useParams();

  return (
    <>
      <FeedProvider contestId={params.id!}>
        <_SubmissionView />
      </FeedProvider>
    </>
  );
}