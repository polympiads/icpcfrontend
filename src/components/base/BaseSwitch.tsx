import {
  createEffect,
  createMemo,
  createSignal,
  Show,
  type Accessor,
  type Component,
  type JSXElement,
  type ParentProps,
} from "solid-js";
import { BaseTransition, type VisibilityProps } from "./BaseTransition";
import { Transition } from "solid-transition-group";
import "./BaseSwitch.css";
import clsx from "clsx";

export type SwitchProperties<T> = {
  pulseValue: Accessor<T>;
  children?: (v: T) => JSXElement;
  class?: string;
  containerClass?: string;
};

type ContainersProps = {
  valueAContainer: Accessor<HTMLDivElement | undefined>;
  valueBContainer: Accessor<HTMLDivElement | undefined>;
};

type SwitchContext = {
  width: Accessor<number>;
  height: Accessor<number>;
  valueA: Accessor<JSXElement>;
  valueB: Accessor<JSXElement>;
  showNumA: Accessor<boolean>;
  activateTransitions: Accessor<boolean>;
};

function createSwitchContext<T>(
  props: SwitchProperties<T> & ContainersProps,
): SwitchContext {
  const number = createMemo(() =>
    props.children ? props.children(props.pulseValue()) : undefined,
  );

  const [valueA, setValueA] = createSignal(number());
  const [valueB, setValueB] = createSignal(number());
  const [showNumA, setShowNumA] = createSignal(true);

  const [width, setWidth] = createSignal(0);
  const [height, setHeight] = createSignal(0);

  createEffect(() => {
    number();
    let v = setShowNumA((v) => !v);
    if (v) {
      setValueA(number());
    } else {
      setValueB(number());
    }

    setActivateTransitions(true);
  });

  createEffect(() => {
    const el = showNumA() ? props.valueAContainer() : props.valueBContainer();

    if (!el) return;

    queueMicrotask(() => {
      setWidth(el.scrollWidth);
      setHeight(el.scrollHeight);
    });
  });

  const [activateTransitions, setActivateTransitions] = createSignal(false);

  return {
    valueA,
    valueB,
    width,
    height,
    showNumA,
    activateTransitions,
  };
}

function TopDownTransition(props: VisibilityProps & ParentProps) {
  return (
    <>
      <Transition enterActiveClass="topDownEnter" exitActiveClass="topDownExit">
        <Show when={props.visible}>{props.children}</Show>
      </Transition>
    </>
  );
}

type TransitionComponentProp = {
  transitionComponent: Component<{ visible: boolean } & ParentProps>;
};

function _BaseSwitch<T>(props: SwitchProperties<T> & TransitionComponentProp) {
  const [valueAContainer, setValueAContainer] = createSignal<HTMLDivElement>();
  const [valueBContainer, setValueBContainer] = createSignal<HTMLDivElement>();

  const { width, height, activateTransitions, showNumA, valueA, valueB } =
    createSwitchContext({ valueAContainer, valueBContainer, ...props });

  return (
    <>
      <div
        class={clsx("relative", props.class)}
        style={{
          width: props.class?.includes("w-full") ? undefined : `${width()}px`,
          height: props.class?.includes("h-full") ? undefined : `${height()}px`,
        }}
        classList={{
          "transition-all": activateTransitions(),
          "duration-100": activateTransitions(),
        }}
      >
        <props.transitionComponent visible={showNumA()}>
          <div
            ref={setValueAContainer}
            class={clsx(
              "whitespace-nowrap",
              props.containerClass,
              !showNumA() && "relative",
              showNumA() && "absolute",
            )}
          >
            {valueA()}
          </div>
        </props.transitionComponent>
        <props.transitionComponent visible={!showNumA()}>
          <div
            ref={setValueBContainer}
            class={clsx(
              "whitespace-nowrap",
              props.containerClass,
              showNumA() && "relative",
              !showNumA() && "absolute",
            )}
          >
            {valueB()}
          </div>
        </props.transitionComponent>
      </div>
    </>
  );
}

function TopDown<T>(props: SwitchProperties<T>) {
  return (
    <>
      <_BaseSwitch
        transitionComponent={(props) => (
          <TopDownTransition visible={props.visible}>
            {props.children}
          </TopDownTransition>
        )}
        {...props}
      />
    </>
  );
}

function FadeInAndOut<T>(props: SwitchProperties<T>) {
  return (
    <>
      <_BaseSwitch
        transitionComponent={(props) => (
          <BaseTransition.FadeIn visible={props.visible}>
            {props.children}
          </BaseTransition.FadeIn>
        )}
        {...props}
      />
    </>
  );
}

export const BaseSwitch = Object.assign(_BaseSwitch, {
  TopDown: TopDown,
  FadeInAndOut: FadeInAndOut,
});
