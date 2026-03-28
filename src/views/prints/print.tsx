import { FeedProvider } from "../../worker/context/FeedContext";
import { useParams } from "../../components/base/BaseRoute";
import { UserInfoWidget } from "../../widgets/UserInfoWidget";
import { AppDefaultLayout } from "../../components/layout/AppDefaultLayout";
import { PrintViewer } from "../../components/prolblem/PrintViewer";
import { usePrint } from "../../worker/hooks/usePrints";
import { markPrintAsDone } from "../../utils/Print";
import { useAuth } from "../../worker/context/AuthContext";
import { AppButton } from "../../components/AppButton";

function _PrintView () {
  const auth = useAuth();
  const params = useParams();

  const print_id = params.print_id!;

  const print = usePrint(print_id);

  const canMarkAsDone = () => print()?.status != "ready";

  async function markAsDone () {
    await markPrintAsDone(
      params.id!,
      print_id,
      auth.session()!
    )
  }

  // TODO enable download of pdf
  // TODO mark print as done

  return <AppDefaultLayout
        headerComponents={
          <>
            {/* Space */}
            <div class="grow" />
  
            <UserInfoWidget />
          </>
        }>
    <AppButton disabled={canMarkAsDone()} onClick={markAsDone}> Mark as done </AppButton>
    <>Current status "{print()?.status}"</>
    <PrintViewer printId={print_id} />
  </ AppDefaultLayout>
}

export function PrintView () {
  const params = useParams();

  return (
    <>
      <FeedProvider contestId={params.id!}>
        <_PrintView />
      </FeedProvider>
    </>
  );
}

