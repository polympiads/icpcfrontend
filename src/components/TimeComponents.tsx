import type { Dayjs } from "dayjs";
import duration from "dayjs/plugin/duration"
import dayjs from "dayjs"
import { For, Show } from "solid-js";
import { createEffect, createMemo, createSignal } from "solid-js";
import { Transition, TransitionGroup } from "solid-transition-group";
import { BaseTransition } from "./base/BaseTransition";
import { BaseSwitch } from "./base/BaseSwitch";

dayjs.extend(duration)

function TimeNumber(props: { number: string, minWidth: number, visible?: boolean }) {
  const number = createMemo(() => props.number.padStart(props.minWidth, '0'))
  // memoes.reverse()
  
  function range(start: number, end: number, step = 1) {
    return Array.from({ length: Math.ceil((end - start) / step) }, (_, i) => start + i * step);
  }
  
  return (
    <>
      <TransitionGroup enterClass="w-0" enterToClass="w-2" exitClass="w-2" exitToClass="w-0" enterActiveClass="animate-fade-in" exitActiveClass="animate-fade-out">
        <For each={(props.visible ?? true) && range(0, Math.max(props.minWidth, number().length))}>
          {(item) =>
            <div class="transition-all duration-100">
              <BaseSwitch.TopDown pulseValue={ () => number()[item] }>
                {(digit) => (
                  <div> { digit } </div>
                )}
              </BaseSwitch.TopDown>
            </div>
          }
        </For>
      </TransitionGroup>
    </>
  )
}

export function HourView(props: { day: Dayjs }) {
  const hours = createMemo(() => props.day.hour())
  const minutes = createMemo(() => props.day.minute())
  const seconds = createMemo(() => props.day.second())
  
  return (
    <>
      <div class="flex flex-row leading-none">
        <TimeNumber number={hours().toString()} minWidth={2}/>
        :
        <TimeNumber number={minutes().toString()} minWidth={2}/>
        :
        <TimeNumber number={seconds().toString()} minWidth={2}/>
      </div>
    </>
  )
}

function TimeSeparator(props: { animatePulse?: any, pulse?: boolean }) {
  const [mode, setMode] = createSignal(false)
  
  createEffect(() => {
    if (props.animatePulse && (props.pulse ?? false)) {
      setMode((v) => !v)
    }
  })
  
  return (
    <>
      <div classList={{"opacity-50": mode()}}>:</div>
    </>
  )
}

export function DurationView(props: { duration: duration.Duration, showSeconds?: boolean, hourVisible?:boolean, separatorPulse?: boolean }) {
  const hours = createMemo(() => props.duration.hours())
  const minutes = createMemo(() => props.duration.minutes())
  const seconds = createMemo(() => props.duration.seconds())
  
  const hourVisible = createMemo(() => (hours() != 0 || (props.hourVisible ?? false)))
  
  return (
    <>
      <div class="flex flex-row transition-all leading-none">
        <TimeNumber number={hours().toString()} minWidth={1} visible={hourVisible()}/>
        
        <Transition enterActiveClass="animate-fade-in" exitActiveClass="animate-fade-out w-0">
          <Show when={hourVisible()}>
            <TimeSeparator animatePulse={props.duration} pulse={props.separatorPulse}/>
          </Show>
        </Transition>
        
        <TimeNumber number={minutes().toString()} minWidth={hourVisible() ? 2 : 1} />
        
        <BaseTransition.FadeInWidth visible={props.showSeconds ?? true}>
          <div class="flex flex-row transition-all duration-100">
            <TimeSeparator animatePulse={props.duration} pulse={props.separatorPulse}/>
            <TimeNumber number={seconds().toString()} minWidth={2}/>
          </div>
        </BaseTransition.FadeInWidth>
        
        <BaseTransition.FadeInWidth visible={!hourVisible() && !(props.showSeconds ?? true)}>
          <div class="overflow-hidden transition-all duration-100">
            m
          </div>
        </BaseTransition.FadeInWidth>
      </div>
    </>
  )
}