import { Button } from "@kobalte/core/button";
import { Check } from "lucide-solid";
import { BsCopy, BsExclamationTriangle } from "solid-icons/bs";
import { createSignal, onCleanup } from "solid-js";
import { useAppEditorContext } from "./Editor";

function CopyButton(props: { class: string }) {
  const { code } = useAppEditorContext();

  const [copied, setCopied] = createSignal(false);
  const [error, setError] = createSignal(false);

  let timeoutId: number | undefined;

  function resetStates() {
    setCopied(false);
    setError(false);
  }

  async function copyOnClipboard() {
    const value = code();
    if (value === undefined) return;

    // clear any existing timeout before setting a new one
    if (timeoutId) clearTimeout(timeoutId);

    try {
      await navigator.clipboard.writeText(value);

      setError(false);
      setCopied(true);
    } catch {
      setCopied(false);
      setError(true);
    }

    timeoutId = window.setTimeout(() => {
      resetStates();
    }, 1500);
  }

  onCleanup(() => {
    if (timeoutId) clearTimeout(timeoutId);
  });

  return (
    <Button
      class={props.class}
      onClick={copyOnClipboard}
    >
      {copied() ? (
        <Check size="1rem" />
      ) : error() ? (
        <BsExclamationTriangle size="1rem" />
      ) : (
        <BsCopy size="1rem" />
      )}
    </Button>
  );
}

export function SolidCopyButton() {
  return (
    <CopyButton class="cursor-pointer flex justify-center items-center bg-white hover:bg-gray-100 disabled:cursor-default duration-50 shrink-0 h-full aspect-square"/>
  );
}

export function FloatingCopyButton() {
  return (
    <CopyButton class="p-1 cursor-pointer flex flex-row justify-center items-center border border-black/10 bg-white hover:bg-gray-100 disabled:cursor-default rounded-md duration-50 shrink-0"/>
  );
}
