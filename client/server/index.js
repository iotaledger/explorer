const express = require("express");
const fs = require("fs");
const path = require("path");

const LEGACY_MAINNET = "legacy-mainnet";
const MAINNET = "mainnet";
const DEVNET = "devnet";
const SHIMMER = "shimmer";
const TESTNET = "testnet";
const ALPHANET = "alphanet";
const NETWORK_REGEX = /^\/(\w+)\/*/;

const PORT = process.env.PORT ?? 3000;
const indexPath = path.resolve(__dirname, "..", "build", "index.html");
const app = express();

app.use(express.static(
    path.resolve(__dirname, "..", "build"), { index: false }
));

app.get("/*", (req, res) => {
    fs.readFile(indexPath, "utf8", (err, indexHtml) => {
        if (err) {
            console.error("Error during file reading", err);
            return res.status(404).end();
        }

        const label = getNetworkLabel(req.url);

        indexHtml = indexHtml.replace(
            '<meta name="apple-mobile-web-app-title" content="Tangle Explorer"',
            `<meta name="apple-mobile-web-app-title" content="${label} Explorer"`
        )
        .replace(
            '<meta name="application-name" content="Tangle Explorer"',
            `<meta name="application-name" content="${label} Explorer"`
        )
        .replace(
            '<meta name="description" content="Explorer for viewing transactions and data stored on the Tangle."',
            `<meta name="description" content="${label} Explorer for viewing transactions and data stored on the Tangle."`
        )
        .replace(
            '<title>Tangle Explorer</title>',
            `<title>${label} Explorer</title>`
        );

        return res.send(indexHtml);
    });
});

app.listen(PORT, () => {
    console.log(`Index server listening on ${PORT}`);
});

const getNetworkLabel = (url) => {
    let networkLabel = "Tangle";
    if (!url || url.length === 0 || !url.startsWith("/")) {
        return networkLabel;
    }

    const networkMatch = NETWORK_REGEX.exec(url);

    if (networkMatch && networkMatch.length > 1) {
        const urlNetwork = networkMatch[1];
        switch (urlNetwork) {
            case MAINNET:
            case LEGACY_MAINNET:
            case DEVNET:
                networkLabel = "IOTA Tangle";
                break;
            case SHIMMER:
                networkLabel = "Shimmer";
                break;
            case TESTNET:
                networkLabel = "Testnet";
                break;
            case ALPHANET:
                networkLabel = "Alphanet";
                break;
            default:
                networkLabel = "Tangle";
        }
    }

    return networkLabel;
};

