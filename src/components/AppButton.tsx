import type { OverrideComponentProps } from "@kobalte/core";
import {
  Button,
  type ButtonRootCommonProps,
  type ButtonRootOptions,
} from "@kobalte/core/button";
import clsx from "clsx";
import { splitProps, untrack } from "solid-js";

interface AppButtonOptions extends ButtonRootOptions {
  variant: keyof typeof variant_class_map;
  spacing: keyof typeof spacing_map;
  inner_spacing: keyof typeof inner_spacing_map;
}

type AppButtonProps = OverrideComponentProps<
  "button",
  Partial<AppButtonOptions & ButtonRootCommonProps>
>;

const variant_class_map = {
  default: {
    class:
      "rounded-md cursor-pointer flex flex-row justify-center items-center bg-sky-300 disabled:bg-sky-200 disabled:cursor-default duration-100 hover:bg-sky-400 shrink-0 disabled:*:opacity-75",
  },
  dangerous: {
    class:
      "rounded-md cursor-pointer flex flex-row justify-center items-center bg-red-700 disabled:cursor-default duration-100 hover:bg-red-600 text-white shrink-0",
  },
  blank: {
    class:
      "cursor-pointer flex flex-row justify-center items-center hover:bg-black/20 disabled:cursor-default rounded-md duration-100 shrink-0",
  },
  border: {
    class:
      "cursor-pointer flex flex-row justify-center items-center outline-0 hover:outline-2 -outline-offset-2 disabled:cursor-default rounded-md duration-50 shrink-0",
  },
  white: {
    class:
      "cursor-pointer flex flex-row justify-center items-center border border-black/10 bg-white hover:bg-gray-100 disabled:cursor-default rounded-md duration-50 shrink-0",
  },
};

const spacing_map = {
  default: "p-3",
  small: "p-2",
  tiny: "p-1",
  none: "",
};

const inner_spacing_map = {
  default: "*:not-last:mr-1",
};

export function AppButton(props: AppButtonProps) {
  const [local, others] = splitProps(props, [
    "variant",
    "class",
    "spacing",
    "inner_spacing",
  ]);
  const staticProps = untrack(() => ({
    variant: local.variant,
    spacing: local.spacing,
    inner_spacing: local.inner_spacing,
    class: local.class,
  }));

  const style = clsx(
    staticProps.variant
      ? variant_class_map[staticProps.variant].class
      : variant_class_map["default"].class,
    staticProps.spacing
      ? spacing_map[staticProps.spacing]
      : spacing_map["default"],
    staticProps.inner_spacing
      ? inner_spacing_map[staticProps.inner_spacing]
      : inner_spacing_map["default"],
    staticProps.class ? staticProps.class : "",
  );

  return (
    <>
      <Button class={style} {...others} />
    </>
  );
}
