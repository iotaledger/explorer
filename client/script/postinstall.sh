#!/bin/bash

NODE_MODULES="./node_modules"
TARGET="./public/wasm"

mkdir -p "$TARGET"

# stardust
cp "$NODE_MODULES/@iota/sdk-wasm/web/wasm/iota_sdk_wasm_bg.wasm" "$TARGET/iota_sdk_stardust_wasm_bg.wasm"
# nova
cp "$NODE_MODULES/@iota/sdk-wasm-nova/web/wasm/iota_sdk_wasm_bg.wasm" "$TARGET/iota_sdk_nova_wasm_bg.wasm"

