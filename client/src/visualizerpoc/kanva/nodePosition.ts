self.addEventListener("message", (e: MessageEvent<string>) => {
    self.postMessage("pong");
});

export {};
