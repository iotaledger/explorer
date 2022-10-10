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

/*
 * Express.js server with only purpose to intercept requests for index.html and inject
 * the right metadata & favicon dynamically depending on the network requested in the URL.
 * Needed only so that link unfurling from other apps gets the right data.
 * On deploy to Vercel, it will be run as a serverless function as
 * node.js code in {projetRoot}/api folder is picked up automagically by convention.
 *
 * Check ./vercel.json for additional configuration:
 *  - rewrites makes vercel forward requests to this serverless function
 *  - outputDirectory makes vercel serve static files from the build folder
 *
 * Because of outputDirectory config, we don't need to serve static files here with middleware
 * like app.use(express.static('public'))
 *
 * If you want to test this locally, enable the serving of static files by add the following line:
 * app.use(express.static(path.resolve(__dirname, "..", "build"), { index: false }));
 */
app.get("/*", (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
    fs.readFile(indexPath, "utf8", (err, indexHtml) => {
        if (err) {
            console.error("Error during file reading", err);
            return res.status(404).end();
        }

        const label = getNetworkLabel(req.url);
        indexHtml = indexHtml.replace(
            '<meta name="apple-mobile-web-app-title" content="Tangle Explorer"',
            `<meta name="apple-mobile-web-app-title" content="${label} Explorer"`
        ).replace(
            '<meta name="application-name" content="Tangle Explorer"',
            `<meta name="application-name" content="${label} Explorer"`
        ).replace(
            '<meta name="description" content="Explorer for viewing transactions and data on the Tangle."',
            `<meta name="description" content="${label} Explorer for viewing transactions and data on the Tangle."`
        ).replace(
            '<title>Tangle Explorer</title>',
            `<title>${label} Explorer</title>`
        );

        const isShimmer = isShimmerNetwork(req.url);
        const publicUrl = process.env.PUBLIC_URL ?? "";
        if(isShimmer) {
            // replace favicons
            indexHtml = indexHtml.replace(
                `<link rel="shortcut icon" href="${publicUrl}/favicon/iota/favicon.ico" data-react-helmet="true"/>`,
                `<link rel="shortcut icon" href="${publicUrl}/favicon/shimmer/favicon.ico" data-react-helmet="true"/>`
            ).replace(
                `<link rel="manifest" href="${publicUrl}/favicon/iota/site.webmanifest" data-react-helmet="true"/>`,
                `<link rel="manifest" href="${publicUrl}/favicon/shimmer/site.webmanifest" data-react-helmet="true"/>`
            ).replace(
                `<link rel="apple-touch-icon" sizes="180x180" href="${publicUrl}/favicon/iota/favicon-180x180.png" data-react-helmet="true"/>`,
                `<link rel="apple-touch-icon" sizes="180x180" href="${publicUrl}/favicon/shimmer/favicon-180x180.png" data-react-helmet="true"/>`
            ).replace(
                `<link rel="icon" type="image/png" sizes="32x32" href="${publicUrl}/favicon/iota/favicon-32x32.png" data-react-helmet="true"/>`,
                `<link rel="icon" type="image/png" sizes="32x32" href="${publicUrl}/favicon/shimmer/favicon-32x32.png" data-react-helmet="true"/>`
            ).replace(
                `<link rel="icon" type="image/png" sizes="16x16" href="${publicUrl}/favicon/iota/favicon-16x16.png" data-react-helmet="true"/>`,
                `<link rel="icon" type="image/png" sizes="16x16" href="${publicUrl}/favicon/shimmer/favicon-16x16.png" data-react-helmet="true"/>`
            )
        }

        return res.send(indexHtml);
    });
});

app.listen(PORT, () => {
    console.log(`Index server listening on ${PORT}`);
});

const isShimmerNetwork = (url) => {
    if (!url || url.length === 0 || !url.startsWith("/")) {
        return false;
    }
    const networkMatch = NETWORK_REGEX.exec(url);
    if (
        networkMatch && networkMatch.length > 1 &&
        (networkMatch[1] === SHIMMER || networkMatch[1] === TESTNET || networkMatch[1] === ALPHANET)
    ) {
        return true;
    }
    return false;
}

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

module.exports = app;
