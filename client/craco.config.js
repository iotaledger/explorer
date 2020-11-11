const CopyWebPlugin= require('copy-webpack-plugin');

module.exports = {
    eslint: {
        enable: false
    },
    webpack: {
        plugins: [
            new CopyWebPlugin({
                patterns: [
                    {
                      from: 'node_modules/iota-identity-wasm-test/web/iota_identity_wasm_bg.wasm',
                      to: 'static/iota_identity_wasm_bg.wasm'
                    }
                ]
            }),
        ]
    }
};