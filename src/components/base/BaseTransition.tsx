import {
  createContext,
  createSignal,
  onCleanup,
  Show,
  type ParentProps,
  type Setter,
} from "solid-js";
import { splitProps, useContext } from "solid-js";
import { Transition, type TransitionProps } from "solid-transition-group";

export type VisibilityProps = {
  visible: boolean;
};

function FadeInWidth(props: VisibilityProps & ParentProps) {
  return (
    <>
      <Transition
        onEnter={(el, done) => {
          try {
            el.getAnimations().forEach((a) => a.cancel());

            const a = el.animate(
              [
                { opacity: 0, width: "0px" },
                { opacity: 1, width: `${el.scrollWidth}px` },
              ],
              { duration: 100 },
            );
            a.finished
              .then(() => done())
              .catch(() => done())
          } catch (e) {
            done();
          }
        }}
        onExit={(el, done) => {
          try {
            el.getAnimations().forEach((a) => a.cancel());

            const a = el.animate(
              [
                { opacity: 1, width: `${el.scrollWidth}px` },
                { opacity: 0, width: "0px" },
              ],
              { duration: 100 },
            );
            a.finished
              .then(() => done())
              .catch(() => done())
          } catch (e) {
            done();
          }
        }}
      >
        <Show when={props.visible}>{props.children}</Show>
      </Transition>
    </>
  );
}

function FadeIn(props: VisibilityProps & ParentProps) {
  return (
    <>
      <Transition
        onEnter={(el, done) => {
          try {
            el.getAnimations().forEach((a) => a.cancel());

            const a = el.animate([{ opacity: 0 }, { opacity: 1 }], {
              duration: 100,
            });
            a.finished
              .then(() => done())
              .catch(() => done())
          } catch (e) {
            done();
          }
        }}
        onExit={(el, done) => {
          try {
            el.getAnimations().forEach((a) => a.cancel());

            const a = el.animate([{ opacity: 1 }, { opacity: 0 }], {
              duration: 100,
            });
            a.finished
              .then(() => done())
              .catch(() => done());
          } catch (e) {
            done();
          }
        }}
      >
        <Show when={props.visible}>{props.children}</Show>
      </Transition>
    </>
  );
}

type BaseTransitionContextProps = {
  setOnAfterExit: Setter<(() => void)[]>;
};

const Context = createContext<BaseTransitionContextProps>();

function _BaseTransition(props: TransitionProps & ParentProps) {
  const [customized, others] = splitProps(props, ["onAfterEnter", "children"]);
  const [onAfterExit, setOnAfterExit] = createSignal<(() => void)[]>([]);

  return (
    <>
      <Context.Provider value={{ setOnAfterExit: setOnAfterExit }}>
        <Transition
          onAfterExit={(el) => {
            onAfterExit().forEach((f) => f());
            setOnAfterExit([]);

            if (props.onAfterExit) {
              props.onAfterExit(el);
            }
          }}
          {...others}
        >
          {customized.children}
        </Transition>
      </Context.Provider>
    </>
  );
}

export function onTransitionAfterExit(f: () => void) {
  const context = useContext(Context);
  if (!context) {
    return;
  }

  onCleanup(() => {
    context.setOnAfterExit((v) => [...v, f]);
  });
}

export const BaseTransition = Object.assign(_BaseTransition, {
  FadeInWidth: FadeInWidth,
  FadeIn: FadeIn,
});
