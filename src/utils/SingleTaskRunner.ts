import { createSignal, type Accessor, type Setter } from "solid-js"

export class SingleTaskRunner<U> {
  private runningTask: Promise<void> | undefined
  lastValue: Accessor<U | undefined>
  private setLastValue: Setter<U | undefined>
  
  isRunning: Accessor<boolean>
  private setIsRunning: Setter<boolean>
  
  onFinish: (value: U) => void = (_) => { }
  onError: (e: any) => void = (_) => { }
  finally: () => void = () => {}
  
  constructor() {
    [this.isRunning, this.setIsRunning] = createSignal(false);
    [this.lastValue, this.setLastValue] = createSignal();
  }
  
  private callOnFinish(value: U) {
    this.setLastValue(() => value)
    this.onFinish(value)
  }
  
  private callFinally() {
    this.finally()
  }
  
  runTask(task: Promise<U>) {
    if (this.isRunning()) {
      throw "A task is already running"
    }
    
    this.setIsRunning(true)
    this.runningTask = task
      .then(this.callOnFinish.bind(this))
      .catch(this.onError.bind(this))
      .finally(() => {
        this.runningTask = undefined
        this.callFinally.bind(this)
        this.setIsRunning(false)
      })
  }
  
  clearLastValue() {
    this.setLastValue(undefined)
  }
}