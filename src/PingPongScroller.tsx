import { createSignal, onMount, onCleanup, type ComponentProps } from "solid-js";

type PingPongScrollerProps = ComponentProps<"div"> & {
  speed?: number;
  pauseOnHover?: boolean;
  hoverOnly?: boolean;
  edgePauseMs?: number;
  showEdgeGradient?: boolean;
  fadeWidth?: number; // width of the gradient in pixels
  fadeSpeed?: number; // opacity change per ms
};

export default function PingPongScroller(props: PingPongScrollerProps) {
  let containerRef!: HTMLDivElement;
  let textRef!: HTMLDivElement;

  const speed = props.speed ?? 0.5;
  const pauseOnHover = props.pauseOnHover ?? true;
  const hoverOnly = props.hoverOnly ?? false;
  const edgePauseMs = props.edgePauseMs ?? 800;
  const showEdgeGradient = props.showEdgeGradient ?? true;
  const fadeWidth = props.fadeWidth ?? 24;
  const fadeSpeed = props.fadeSpeed ?? 0.005; // per ms

  const [position, setPosition] = createSignal(0);
  const [direction, setDirection] = createSignal<-1 | 1>(-1);
  const [maxScroll, setMaxScroll] = createSignal(0);
  const [paused, setPaused] = createSignal(hoverOnly);
  const [isEdgePaused, setIsEdgePaused] = createSignal(false);

  const [leftOpacity, setLeftOpacity] = createSignal(0);
  const [rightOpacity, setRightOpacity] = createSignal(0);

  let frameId: number;
  let lastTime = performance.now();
  let edgeTimeout: number | null = null;

  const calculateBounds = () => {
    if (!containerRef || !textRef) return;
    const containerWidth = containerRef.offsetWidth;
    const textWidth = textRef.scrollWidth;
    setMaxScroll(Math.max(0, textWidth - containerWidth));
    setPosition((p) => Math.min(0, Math.max(-maxScroll(), p)));
  };

  const triggerEdgePause = () => {
    setIsEdgePaused(true);
    if (edgeTimeout) clearTimeout(edgeTimeout);
    edgeTimeout = window.setTimeout(() => {
      setDirection((d) => (d === -1 ? 1 : -1));
      setIsEdgePaused(false);
    }, edgePauseMs);
  };

  const animate = (time: number) => {
    const dt = time - lastTime;
    lastTime = time;

    // move text
    if (!paused() && !isEdgePaused() && maxScroll() > 0) {
      let pos = position() + speed * direction();
      const leftLimit = 0;
      const rightLimit = -maxScroll();

      if (pos >= leftLimit) {
        pos = leftLimit;
        triggerEdgePause();
      } else if (pos <= rightLimit) {
        pos = rightLimit;
        triggerEdgePause();
      }
      setPosition(pos);
    }

    // update gradient opacities linearly
    const leftTarget = position() < 0 ? 1 : 0;
    const rightTarget = position() > -maxScroll() ? 1 : 0;

    setLeftOpacity((o) => {
      if (o < leftTarget) return Math.min(leftTarget, o + fadeSpeed * dt);
      else return Math.max(leftTarget, o - fadeSpeed * dt);
    });

    setRightOpacity((o) => {
      if (o < rightTarget) return Math.min(rightTarget, o + fadeSpeed * dt);
      else return Math.max(rightTarget, o - fadeSpeed * dt);
    });

    frameId = requestAnimationFrame(animate);
  };

  const handleMouseEnter = () => {
    if (hoverOnly) setPaused(false);
    else if (pauseOnHover) setPaused(true);
  };

  const handleMouseLeave = () => {
    if (hoverOnly) {
      setPaused(true)
      setPosition(0)
      setLeftOpacity(0)
      setRightOpacity(0 > -maxScroll() ? 1 : 0)
    }
    else if (pauseOnHover) setPaused(false);
  };

  onMount(() => {
    const ro = new ResizeObserver(calculateBounds);
    if (containerRef) ro.observe(containerRef);
    if (textRef) ro.observe(textRef);

    lastTime = performance.now();
    frameId = requestAnimationFrame(animate);

    onCleanup(() => {
      ro.disconnect();
      cancelAnimationFrame(frameId);
      if (edgeTimeout) clearTimeout(edgeTimeout);
    });
  });

  const computeMask = () => {
    if (!showEdgeGradient || maxScroll() <= 0) return "none";

    const leftStop = fadeWidth * leftOpacity();
    const rightStop = fadeWidth * rightOpacity();

    return `linear-gradient(to right,
      transparent 0px,
      black ${leftStop}px,
      black calc(100% - ${rightStop}px),
      transparent 100%)`;
  };

  return (
    <div
      ref={containerRef}
      {...props}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      class={`overflow-hidden relative ${props.class ?? ""}`}
      style={{
        "-webkit-mask-image": computeMask(),
        "-webkit-mask-repeat": "no-repeat",
        "-webkit-mask-size": "100% 100%",
        "mask-image": computeMask(),
        "mask-repeat": "no-repeat",
        "mask-size": "100% 100%",
      }}
    >
      <div
        ref={textRef}
        class="inline-block whitespace-nowrap will-change-transform"
        style={{ transform: `translateX(${position()}px)` }}
      >
        {props.children}
      </div>
    </div>
  );
}