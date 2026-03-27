import type { PolymorphicProps } from "@kobalte/core"
import { languageIdToName } from "./Languages"
import { LanguageIcon } from "./LanguageIcon"
import clsx from "clsx"

type LanguageSelectProps = {
  language: string,
}

export function LanguageEntry(props: PolymorphicProps<"div", LanguageSelectProps>) {
  return (
    <>
      <div class={ clsx("h-8 flex flex-row items-center py-1 px-2 duration-75 cursor-pointer overflow-hidden", props.class) }>
        <LanguageIcon language={props.language} class="h-full aspect-square" />
        <div class="py-1 pl-1 font-medium"> { languageIdToName[props.language] ?? props.language } </div>
      </div>
    </>
  )
}