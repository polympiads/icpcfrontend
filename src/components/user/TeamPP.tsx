import { FaSolidUsers } from "solid-icons/fa";
import { BaseImage } from "../base/BaseImage";
import { LoadingAnimation } from "../animations/LoadingAnimation";
import { clsx } from "clsx";
import { RiEditorQuestionMark } from "solid-icons/ri";

const size_map = {
  "sm": "w-9 h-9",
  "default": "w-12 h-12",
  "lg": "w-15 h-15"
}
const loading_size_map: Record<Variant, string> = {
  "sm": "1.3em",
  "default": "1.5em",
  "lg": "1.7em",
}
const fallback_size_map: Record<Variant, string> = {
  "sm": "1.5em",
  "default": "2em",
  "lg": "2.5em",
}

type Variant = keyof typeof size_map

export function TeamPP(props: { src?: string, variant?: Variant }) {
  return (
    <>
      <BaseImage class={clsx("flex items-center justify-center", size_map[props.variant ?? "default"])}>
        <BaseImage.Image src={props.src} class="object-contain w-full h-full"></BaseImage.Image>
        <BaseImage.Loading>
          <LoadingAnimation.SpinningCircle size={loading_size_map[props.variant ?? "default"]} />
        </BaseImage.Loading>
        <BaseImage.Fallback>
          <FaSolidUsers size={fallback_size_map[props.variant ?? "default"]} class="opacity-40" />
        </BaseImage.Fallback>
      </BaseImage>
    </>
  )
}

export function UnkownTeam(props: { src?: string, variant?: Variant }) {
  return (
    <>
      <div class={clsx("flex items-center justify-center", size_map[props.variant ?? "default"])}>
        <RiEditorQuestionMark class="absolute opacity-40" size={fallback_size_map[props.variant ?? "default"]}/>
      </div>
    </>
  )
}