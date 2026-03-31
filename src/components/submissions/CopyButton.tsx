import { createSignal, onCleanup } from "solid-js"
import { AppButton } from "../AppButton"
import { BsCopy, BsExclamationTriangle } from "solid-icons/bs"
import { Check } from "lucide-solid"
import { useAppEditorContext } from "../editor/AppEditor"

export function CopyButton(props: { class?: string }) {
  const { code } = useAppEditorContext()
  
  const [copied, setCopied] = createSignal(false)
  const [error, setError] = createSignal(false)

  let timeoutId: number | undefined

  function resetStates() {
    setCopied(false)
    setError(false)
  }

  async function copyOnClipboard() {
    const value = code()
    if (value === undefined) return

    // clear any existing timeout before setting a new one
    if (timeoutId) clearTimeout(timeoutId)

    try {
      await navigator.clipboard.writeText(value)

      setError(false)
      setCopied(true)
    } catch {
      setCopied(false)
      setError(true)
    }

    timeoutId = window.setTimeout(() => {
      resetStates()
    }, 1500)
  }

  onCleanup(() => {
    if (timeoutId) clearTimeout(timeoutId)
  })

  return (
    <AppButton spacing="tiny" variant="white" onClick={copyOnClipboard} class={ props.class }>
      {copied() ? (
        <Check size="1rem" />
      ) : error() ? (
        <BsExclamationTriangle size="1rem" />
      ) : (
        <BsCopy size="1rem" />
      )}
    </AppButton>
  )
}