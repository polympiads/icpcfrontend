export class NDJsonReader<T> {
  internalBuffer: string[];
  lastToken: string | undefined;

  callback: (x: T[]) => void;
  shouldStop: boolean = false;

  reader: ReadableStreamDefaultReader | undefined;
  toCommit: T[];

  constructor(callback: (x: T[]) => void) {
    this.internalBuffer = [];
    this.toCommit = [];
    this.lastToken = undefined;

    this.callback = callback;
  }

  commit() {
    this.callback(this.toCommit);
    this.toCommit = [];
  }
  pushInternalBuffer() {
    const result = this.internalBuffer.join("");

    // heartbeat
    if (result === "") return;
    const json = JSON.parse(result);

    if (json.token) {
      this.lastToken = json.token;
    }

    this.toCommit.push(json);

    this.internalBuffer = [];
  }

  async streamFromEndpointAndReconnect(
    url: string,
    shouldRetry: () => boolean,
    init?: RequestInit,
  ) {
    try {
      let nextUrl = url;
      if (this.lastToken) {
        nextUrl = `${url}?since_token=${this.lastToken}`;
      }

      await this.streamFromEventFeed(nextUrl, init);
    } catch (err) {
      console.error("Stream dropped, retrying in 3 seconds...", err);
      if (this.shouldStop) {
        console.error("Error, but should stop is set to true.");
        return;
      }
      setTimeout(
        () => this.streamFromEndpointAndReconnect(url, shouldRetry),
        3000,
      );
    }
  }

  close() {
    this.reader?.cancel();
    this.reader?.releaseLock();

    this.shouldStop = true;
  }
  async streamFromEventFeed(url: string, init?: RequestInit) {
    this.internalBuffer = [];

    const response = await fetch(url, init);
    const reader = response.body?.getReader();

    this.reader = reader;
    if (reader === undefined) throw "Could not get reader.";

    try {
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done || this.shouldStop) break;

        const buffer = decoder.decode(value, { stream: true });
        let currentIndex = 0;

        while (1) {
          const nextDelimiter = buffer.indexOf("\n", currentIndex);
          if (nextDelimiter === -1) {
            this.internalBuffer.push(buffer.substring(currentIndex));
            this.commit();
            break;
          }

          this.internalBuffer.push(
            buffer.substring(currentIndex, nextDelimiter),
          );
          this.pushInternalBuffer();
          currentIndex = nextDelimiter + 1;
        }
      }
    } finally {
      reader.cancel();
      reader.releaseLock();
    }
  }
}
