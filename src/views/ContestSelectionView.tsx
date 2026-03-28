import { createEffect, For, Show } from "solid-js"
import { ContestSelectionCard } from "../components/contests/ContestSelectionCard"
import { AutoAnimate } from "../components/base/AutoAnimate"
import { useUserLoginContext } from "../contexts/UserLoginContext"
import { useContestsContext } from "../contexts/ContestsContext"
import { createFineGrainedArray } from "../utils/FineGrainedArray"
import type { Contest } from "../worker/types/data/Contest"
import { UserInfoWidget } from "../widgets/UserInfoWidget"
import { AppDefaultLayout } from "../components/layout/AppDefaultLayout"
import { A } from "@solidjs/router" 
import { PRINTS_URL } from "../utils/Urls"

export function ContestSelectionView() {
  const { is_authenticated, user_info } = useUserLoginContext()
  const contestsRaw = useContestsContext()
  const contests = createFineGrainedArray<Contest>(() => contestsRaw() ?? [], "id")
  
  createEffect(() => console.log(contestsRaw()))
  
  return (
    <>
      <AppDefaultLayout
        headerComponents={(
          <>
            { /* Space */}
            <div class="grow" />
            
            <UserInfoWidget />
          </>
        )}
      >
        <div class="h-full w-full flex justify-center py-8 overflow-auto">
          <div class="w-full-round-80">
            <AutoAnimate>
              <Show when={ is_authenticated() }>
                <div class="text-4xl pb-8 mx-2">
                  Welcome, { user_info()?.display_name ?? '@' + user_info()?.username }
                </div>
              </Show>
            </AutoAnimate>
            
            <AutoAnimate class="flex flex-wrap h-fit-round-60">
              <For each={contests()}>
                {(contest, _) => (
                  <A href={ /* CONTEST_URL(contest.id) */ PRINTS_URL(contest.id) }>
                    <div class="w-80 h-60 will-change-transform transform-gpu">
                      <div class="w-full h-full p-2">
                        <ContestSelectionCard contest={contest} />
                      </div>
                    </div>
                  </A>
                )}
              </For>
            </AutoAnimate>
          </div>
        </div>
      </AppDefaultLayout>
    </>
  )
}