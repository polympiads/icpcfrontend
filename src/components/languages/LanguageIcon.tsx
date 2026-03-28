import { createMemo, splitProps } from "solid-js";

// Import devicon SVGs as raw strings
// import ada from "devicon/icons/ada/ada-original.svg?raw";
import c from "devicon/icons/c/c-original.svg?raw";
import cpp from "devicon/icons/cplusplus/cplusplus-original.svg?raw";
import csharp from "devicon/icons/csharp/csharp-original.svg?raw";
import go from "devicon/icons/go/go-original.svg?raw";
import haskell from "devicon/icons/haskell/haskell-original.svg?raw";
import java from "devicon/icons/java/java-original.svg?raw";
import javascript from "devicon/icons/javascript/javascript-original.svg?raw";
import kotlin from "devicon/icons/kotlin/kotlin-original.svg?raw";
// import objectivec from "devicon/icons/objectivec/objectivec-original.svg?raw";
// import pascal from "devicon/icons/pascal/pascal-original.svg?raw";
import php from "devicon/icons/php/php-original.svg?raw";
import prolog from "devicon/icons/prolog/prolog-original.svg?raw";
import python from "devicon/icons/python/python-original.svg?raw"; // for both python2 & python3
import ruby from "devicon/icons/ruby/ruby-original.svg?raw";
import rust from "devicon/icons/rust/rust-original.svg?raw";
import scala from "devicon/icons/scala/scala-original.svg?raw";
import clsx from "clsx";

// Colored SVGs in Devicon style (simplified for icon size)
export const adaSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" fill="#02f88c"/>
  <text x="50%" y="50%" font-size="28" fill="white" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif">A</text>
</svg>`;

export const pascalSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" fill="#E3A857"/>
  <text x="50%" y="50%" font-size="28" fill="white" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif">P</text>
</svg>`;

export const objcSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" fill="#438eff"/>
  <text x="50%" y="50%" font-size="18" fill="white" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif">ObjC</text>
</svg>`;

const FALLBACK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="100%" height="100%" fill="#ccc" /><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="12" fill="#333">?</text></svg>`;

const ICON_MAP: Record<string, string> = {
  ada: adaSvg,
  c,
  cpp,
  csharp,
  go,
  haskell,
  java,
  javascript,
  kotlin,
  objectivec: objcSvg,
  pascal: pascalSvg,
  php,
  prolog,
  python2: python,
  python3: python,
  ruby,
  rust,
  scala,
};

export type LanguageIconProps = {
  language: string;
  size?: number;
  class?: string;
};

export function LanguageIcon(props: LanguageIconProps) {
  const [local, rest] = splitProps(props, ["language", "size", "class"]);
  
  const svg = createMemo(() => {
    const langKey = local.language.toLowerCase().trim();
    return ICON_MAP[langKey] ?? FALLBACK_SVG;
  })

  return (
    <div
      class={clsx(
        local.class,
        "h-full aspect-square [&>svg]:h-full [&>svg]:w-full [&>svg]:block"
      )}
      innerHTML={svg()}
      {...rest}
    />
  );
}