const ctx: Worker = self as any;

let data = 1;

ctx.addEventListener(
    "message",
    (e: MessageEvent<{ type: string; data: never }>) => {
        const type = e.data?.type;

        if (!e.data || type?.startsWith("webpack")) {
            return; // Ignore the message if it's from Webpack
        }

        data += 1;
        ctx.postMessage(`pong${data}`);
    }
);

export {};
