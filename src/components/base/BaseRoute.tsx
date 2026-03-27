// Solid js router abuse to have transitions available

import { Router, useLocation, type MatchFilters, type Params } from "@solidjs/router"
import { createPathMatcher } from "../../utils/PathMatching"
import { createContext, Show, useContext, type ParentProps } from "solid-js"
import { createMemo } from "solid-js"

type BaseRouteContextProps = {
  matchParams: Params
}

const BaseRouteContex = createContext<BaseRouteContextProps>()

export function useParams() {
  const context = useContext(BaseRouteContex)
  if (context == undefined)
  {
    throw "This function should be used inside a BaseRoute"
  }
  
  return context.matchParams
}

export function BaseRoute(props: { path: string, matchFilters?: MatchFilters } & ParentProps) {
  const currentPath = useLocation()
  const matcher = createPathMatcher(props.path, false, props.matchFilters)
  const matchResult = createMemo(() => matcher(currentPath.pathname))
  
  return (
    <>
      <Show when={matchResult() != null}>
        <BaseRouteContex.Provider value={{ matchParams: matchResult()!.params }}>
          { props.children }
        </BaseRouteContex.Provider>
      </Show>
    </>
  )
}

export function BaseRouter(props: ParentProps) {
  return (
    <>
      <Router root={() => props.children}/>
    </>
  )
}