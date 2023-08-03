const ctx: Worker = self as any;

ctx.addEventListener("message", (e: MessageEvent<string>) => {
    // @ts-expect-error wrong type
    if (!e.data || e.data.type === "webpackOk") {
        return; // Ignore the message if it's from Webpack
    }

    console.log("Worker received message", e);

    ctx.postMessage("pong");
});

export {};
