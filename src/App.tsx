import { WorkerProvider } from "./worker/context/WorkerContext";
import { AuthProvider } from "./worker/context/AuthContext";
import { ContestSelectionView } from "./views/ContestSelectionView";
import { type ParentProps } from "solid-js";
import { InContestView } from "./views/InContestView";
import { BaseTransition } from "./components/base/BaseTransition";
import { BaseRoute, BaseRouter } from "./components/base/BaseRoute";
import { API_URL } from "./utils/Constants";
import { CONTEST_URL_PATTERN, ROOT, SUBMISSION_URL_PATTERN } from "./utils/Urls";
import { SubmissionView } from "./views/SubmissionView";

function AppContext(props: ParentProps) {
  return (
    <>
      <WorkerProvider apiHostname={ API_URL }>
        <AuthProvider>{props.children}</AuthProvider>
      </WorkerProvider>
    </>
  );
}

const filters = {
  id: /^\d+$/,
  submission_id: /^\d+$/,
};

function App() {
  return (
    <AppContext>
      <BaseRouter>
        <BaseTransition
          enterActiveClass="animate-view-zoom-out-enter absolute z-10"
          exitActiveClass="animate-view-zoom-out-exit absolute"
        >
          <BaseRoute path={ ROOT }>
            <ContestSelectionView />
          </BaseRoute>
        </BaseTransition>
  
        <BaseTransition
          enterActiveClass="animate-view-zoom-in-enter absolute z-10"
          exitActiveClass="animate-view-zoom-in-exit absolute"
        >
          <BaseRoute path={ CONTEST_URL_PATTERN } matchFilters={filters}>
            <InContestView />
          </BaseRoute>
        </BaseTransition>
        
        <BaseRoute path={ SUBMISSION_URL_PATTERN } matchFilters={filters}>
          <SubmissionView />
        </BaseRoute>
      </BaseRouter>
    </AppContext>
  );
}

export default App;
