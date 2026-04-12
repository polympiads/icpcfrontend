import { type Accessor, createSignal, type Setter } from "solid-js";

type ResultHandler<U> = (v: U) => void;
type ExceptionHandler = (e: Error) => void;

export class SingleTaskHandler<U> {
  private task: Promise<void> | undefined;
  isRunning: Accessor<boolean>;
  private setRunning: Setter<boolean>;

  onResults: ResultHandler<U>[] = [];
  onError: ExceptionHandler[] = [];

  previousResult: U | undefined;
  previousError: Error | undefined;

  constructor() {
    [this.isRunning, this.setRunning] = createSignal(false);
  }

  spawnTask(task: Promise<U>) {
    if (this.task) {
      throw "A task is already running";
    }

    this.setRunning(true);
    this.task = task
      .catch((e) => {
        for (const f of this.onError) f(e);
        this.previousError = e;
        this.previousResult = undefined;

        return undefined;
      })
      .then((v) => {
        if (v) for (const f of this.onResults) f(v);
        this.previousError = undefined;
        this.previousResult = v;

        this.task = undefined;
        this.setRunning(false);
      });
  }

  registerOnResult(onResult: (v: U) => void) {
    this.onResults.push(onResult);
  }
  removeOnResultHandler(onResult: (v: U) => void) {
    this.onResults.filter((f) => f !== onResult);
  }

  registerOnError(onError: (e: Error) => void) {
    this.onError.push(onError);
  }
  removeOnErrorHandler(onError: (e: Error) => void) {
    this.onResults.filter((f) => f !== onError);
  }

  clearResults() {
    this.previousResult = undefined;
    this.previousError = undefined;
  }
}
