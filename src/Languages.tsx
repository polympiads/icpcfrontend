import type { PolymorphicProps } from "@kobalte/core";
import clsx from "clsx";
import c from "devicon/icons/c/c-original.svg?raw";
import cpp from "devicon/icons/cplusplus/cplusplus-original.svg?raw";
import csharp from "devicon/icons/csharp/csharp-original.svg?raw";
import go from "devicon/icons/go/go-original.svg?raw";
import haskell from "devicon/icons/haskell/haskell-original.svg?raw";
import java from "devicon/icons/java/java-original.svg?raw";
import javascript from "devicon/icons/javascript/javascript-original.svg?raw";
import kotlin from "devicon/icons/kotlin/kotlin-original.svg?raw";
import php from "devicon/icons/php/php-original.svg?raw";
import prolog from "devicon/icons/prolog/prolog-original.svg?raw";
import python from "devicon/icons/python/python-original.svg?raw"; // for both python2 & python3
import ruby from "devicon/icons/ruby/ruby-original.svg?raw";
import rust from "devicon/icons/rust/rust-original.svg?raw";
import scala from "devicon/icons/scala/scala-original.svg?raw";
import { createMemo, splitProps } from "solid-js";
// Import devicon SVGs as raw strings
import ada from "./assets/ada_logo.svg?raw";
import objectivec from "./assets/objective_c.svg?raw";
import pascal from "./assets/pascal.svg?raw";

const languageIdToName: Record<string, string> = {
  ada: "Ada",
  c: "C",
  cpp: "C++",
  csharp: "C#",
  go: "Go",
  haskell: "Haskell",
  java: "Java",
  javascript: "JavaScript",
  kotlin: "Kotlin",
  objectivec: "Objective-C",
  pascal: "Pascal",
  php: "PHP",
  prolog: "Prolog",
  python2: "Python 2",
  python3: "Python 3",
  ruby: "Ruby",
  rust: "Rust",
  scala: "Scala",
};

export function LanguageEntry(
  props: PolymorphicProps<"div", { language: string }>,
) {
  return (
    <div
      class={clsx(
        "h-8 flex flex-row items-center py-1 px-2 duration-75 overflow-hidden",
        props.class,
      )}
    >
      <LanguageIcon language={props.language} class="h-full aspect-square" />
      <div class="py-1 pl-1 font-medium">
        {languageIdToName[props.language]}
      </div>
    </div>
  );
}

export const pascalSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" fill="#E3A857"/>
  <text x="50%" y="50%" font-size="28" fill="white" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif">P</text>
</svg>`;

const FALLBACK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="100%" height="100%" fill="#ccc" /><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="12" fill="#333">?</text></svg>`;

const ICON_MAP: Record<string, string> = {
  ada,
  c,
  cpp,
  csharp,
  go,
  haskell,
  java,
  javascript,
  kotlin,
  objectivec,
  pascal,
  php,
  prolog,
  python2: python,
  python3: python,
  ruby,
  rust,
  scala,
};

type LanguageIconProps = {
  language: string;
  size?: number;
  class?: string;
};

export function LanguageIcon(props: LanguageIconProps) {
  const [local, rest] = splitProps(props, ["language", "size", "class"]);

  const svg = createMemo(() => {
    const langKey = local.language.toLowerCase().trim();
    return ICON_MAP[langKey] ?? FALLBACK_SVG;
  });

  return (
    <div
      class={clsx(
        local.class,
        "h-full aspect-square [&_svg]:w-full [&_svg]:h-full",
      )}
      innerHTML={svg()}
      {...rest}
    />
  );
}
