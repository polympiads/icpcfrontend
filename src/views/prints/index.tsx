import { FeedProvider } from "../../worker/context/FeedContext";
import { useMyAccount } from "../../worker/hooks/useUsers";
import { createMemo, For, Show } from "solid-js";
import { useAuth } from "../../worker/context/AuthContext";
import { useParams } from "../../components/base/BaseRoute";
import { UserInfoWidget } from "../../widgets/UserInfoWidget";
import { AppDefaultLayout } from "../../components/layout/AppDefaultLayout";
import { PrintEditor } from "../../components/editor/PrintEditor";
import { postPrint } from "../../utils/Print";
import { usePrint, usePrints } from "../../worker/hooks/usePrints";
import { A } from "@solidjs/router";
import { PRINT_URL } from "../../utils/Urls";

function PrintComponent (props: {printId: string}) {
  const print = usePrint(props.printId);
  const params = useParams();
  
  return <>
    <A href={ PRINT_URL(params.id!, props.printId) }>
      <div>Print #{props.printId} received from {print().owner_id}, status {print().status}.</div>
    </A>
  </>
}

function PrintsList () {
  const prints = usePrints();
  const print_keys = createMemo(() => {
    const _prints = prints();

    const _keys = Object.keys(_prints).map(x => Number(x)).sort().reverse()
    return _keys.map(x => x.toString())
  });
  
  return <For each={print_keys()} fallback={<div>No prints</div>}>
    {(printId, _rank) => <PrintComponent printId={printId} />}
  </For>
}

function _PrintsView () {
  const params = useParams();
  const contest_id = params.id!;

  const myAccount = useMyAccount();
  const auth = useAuth();

  async function onPrint (code: string) {
    await postPrint(contest_id, code, auth.session()!);
  }

  return <AppDefaultLayout
        headerComponents={
          <>
            {/* Space */}
            <div class="grow" />
  
            <UserInfoWidget />
          </>
        }>
    <Show when={myAccount()?.type === "team"}>
      <PrintEditor onPrint={onPrint} />
    </Show>
    <Show when={myAccount()?.type === "judge"}>
      <PrintsList />
    </Show>
    <Show when={myAccount()?.type === undefined}>
      <>Cannot use prints as a simple user.</>
    </Show>
  </ AppDefaultLayout>
}

export function PrintsView () {
  const params = useParams();

  return (
    <>
      <FeedProvider contestId={params.id!}>
        <_PrintsView />
      </FeedProvider>
    </>
  );
}

