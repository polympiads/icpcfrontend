
export class NDJsonReader<T> {
    internalBuffer : string[];
    lastToken      : string | undefined;

    callback: (x: T) => void;
    shouldStop: boolean = false;

    constructor (callback: (x: T) => void) {
        this.internalBuffer = [];
        this.lastToken      = undefined;

        this.callback = callback;
    }

    pushInternalBuffer () {
        const result = this.internalBuffer.join("");

        // heartbeat
        if (result === "") return ;
        const json   = JSON.parse(result);

        if (json.token) {
          this.lastToken = json.token;
        }

        this.callback(json);

        this.internalBuffer = [];
    }

    async streamFromEndpointAndReconnect (url: string, shouldRetry: () => boolean, init?: RequestInit) {
        try {
            let nextUrl = url;
            if (this.lastToken) {
                nextUrl = `${url}?since_token=${this.lastToken}`;
            }

            await this.streamFromEventFeed(nextUrl, init)
        } catch (err) {
            console.error("Stream dropped, retrying in 3 seconds...", err);
            setTimeout(
                () => this.streamFromEndpointAndReconnect(url, shouldRetry),
                3000
            )
        }
    }
    async streamFromEventFeed (url: string, init?: RequestInit) {
        this.internalBuffer = [];

        const response = await fetch(url, init);
        const reader   = response.body?.getReader();
        if (reader === undefined) throw "Could not get reader.";

        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done || this.shouldStop) break ;

            const buffer = decoder.decode(value, { stream: true });
            let currentIndex = 0;

            while (1) {
                const nextDelimiter = buffer.indexOf('\n', currentIndex);
                if (nextDelimiter === -1) {
                    this.internalBuffer.push(buffer.substring(currentIndex));
                    break ;
                }

                this.internalBuffer.push(buffer.substring(currentIndex, nextDelimiter));
                this.pushInternalBuffer();
                currentIndex = nextDelimiter + 1;
            }
        }
    }
};
