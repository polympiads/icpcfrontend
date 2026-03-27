// entirely vibe-coded

import duration from "dayjs/plugin/duration";
import type { Accessor } from "solid-js";
import {  createMemo, splitProps } from "solid-js";

type StyleProps = {
  size?: string;       // optional, in pixels
  strokeColor?: string;
  strokeWidth?: number;
}

type ClockProps = {
  hourAngle: number | Accessor<number>;   // in degrees, 0 = 12 o'clock
  minuteAngle: number | Accessor<number>; // in degrees, 0 = 12 o'clock
  secondAngle: number | Accessor<number>;
}
  & StyleProps;

export function Clock({
  hourAngle,
  minuteAngle,
  secondAngle,
  size = "100px",
  strokeColor = "currentColor",
  strokeWidth = 2,
  ...props
}: ClockProps) {
  const center = 12;
  const radius = 9;
  
  const hourAngleValue = () => typeof hourAngle === "function" ? hourAngle() : hourAngle;
  const minuteAngleValue = () => typeof minuteAngle === "function" ? minuteAngle() : hourAngle;
  const secondAngleValue = () => typeof secondAngle === "function" ? secondAngle() : hourAngle;
  
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={strokeColor}
      stroke-width={strokeWidth}
      stroke-linecap="round"
      stroke-linejoin="round"
      {...props}
    >
      {/* Clock face */}
      <circle cx={center} cy={center} r={radius} />

      {/* Hour hand */}
      <line
        x1={center}
        y1={center}
        x2={center}
        y2={7}
        transform-origin={`${center} ${center}`}
        style={{
          transform: `rotate(${hourAngleValue()}deg)`,
        }}
      />

      {/* Minute hand */}
      <line
        x1={center}
        y1={center}
        x2={center}
        y2={5}
        transform-origin={`${center} ${center}`}
        style={{ transform: `rotate(${minuteAngleValue()}deg)` }}
      />
      
      <line
        x1={center}
        y1={center}
        x2={center}
        y2={5}
        transform-origin={`${center} ${center}`}
        style={{
          transform: `rotate(${secondAngleValue()}deg)`,
          "stroke-width": strokeWidth / 2
        }}
      />
    </svg>
  );
}

export function DurationClock(props: { duration: duration.Duration } & StyleProps) {
  const [componentProps, others] = splitProps(props, ["duration"])
  const secondAngle = createMemo(() => componentProps.duration.seconds() / 60 * 360)
  const minuteAngle = createMemo(() => componentProps.duration.minutes() / 60 * 360)
  const hourAngle = createMemo(() => componentProps.duration.hours() / 12 * 360)
  
  return (
    <>
      <Clock secondAngle={secondAngle} minuteAngle={minuteAngle} hourAngle={hourAngle} {...others} />
    </>
  )
}