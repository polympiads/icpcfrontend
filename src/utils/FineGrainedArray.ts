import { createEffect, type Accessor } from "solid-js";
import { createStore, reconcile } from "solid-js/store";

export function createFineGrainedArray<T extends Record<string, any>>(input: Accessor<T[]>, keyField: keyof T) {
  const [store, setStore] = createStore<T[]>([])
  
  createEffect(() => {
    const value = input()
    setStore(reconcile(value, { key: keyField as string }))
  })
  
  return () => store
}
