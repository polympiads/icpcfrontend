import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import {
  type Accessor,
  createContext,
  createSignal,
  onCleanup,
  onMount,
  type ParentProps,
  useContext,
} from "solid-js";

export type NowContextProps = {
  now: Accessor<Dayjs>;
};

const NowContext = createContext<NowContextProps>();

export function NowProvider(props: ParentProps) {
  const nowContext = useContext(NowContext);
  if (nowContext) {
    return props.children;
  } else {
    const [now, setNow] = createSignal(dayjs());

    onMount(() => {
      const interval = setInterval(() => setNow(dayjs()), 1000);
      onCleanup(() => clearInterval(interval));
    });

    return (
      <NowContext.Provider value={{ now }}>
        {props.children}
      </NowContext.Provider>
    );
  }
}

export function useNow() {
  const nowContext = useContext(NowContext);
  if (!nowContext) {
    throw "useNow should be used inside a NowProvider";
  }

  return nowContext;
}
