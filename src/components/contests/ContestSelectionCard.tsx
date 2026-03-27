import { BsQuestionSquareFill } from "solid-icons/bs";
import { BaseImage } from "../base/BaseImage";
import { LoadingAnimation } from "../animations/LoadingAnimation";
import type { Contest } from "../../worker/types/data/Contest";
import { ContestStatus } from "./ContestStatus";

export function ContestSelectionCard(props: { contest: Contest }) {
  return (
    <>
      <div class="w-full h-full bg-white border border-black/10 rounded-md shadow-xl in-[.animate-card-fade-out]:shadow-none in-[.animate-card-fade-out]:z-0 flex flex-col items-overflow-hidden hover:scale-105 duration-100 cursor-pointer hover:shadow-black/30 hover:z-10 hover:shadow-2xl">
        <div class="grow">
          <BaseImage>
            <BaseImage.Image />
            <BaseImage.Loading>
              <LoadingAnimation.WaveBackground />
            </BaseImage.Loading>
            <BaseImage.Fallback>
              <div class="w-full h-full flex items-center justify-center">
                <BsQuestionSquareFill size="3em" class="opacity-40"/>
              </div>
            </BaseImage.Fallback>
          </BaseImage>
        </div>
        <div class="flex flex-col items-start p-2 border-t border-black/20">
          <div class="text-2xl font-medium mb-1">
            { props.contest.formal_name }
          </div>
          <ContestStatus contest={props.contest}/>
        </div>
      </div>
    </>
  )
}