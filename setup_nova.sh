#!/bin/bash
SDK_DIR="iota-sdk"
TARGET_COMMIT="8d3f742c07ea94669d6e7ab7f8a85fe9d48c7af8"

if [ ! -d "$SDK_DIR" ]; then
  git clone -b 2.0 git@github.com:iotaledger/iota-sdk.git
  cd "./$SDK_DIR"
else
  echo "Pulling nova-sdk..."
  cd "./$SDK_DIR"
  git pull
fi

echo "Checking out nova-sdk commit $TARGET_COMMIT"
git checkout "$TARGET_COMMIT"

echo "Building nodejs bindings"
cd "./bindings/nodejs"
yarn
yarn build

echo "Building wasm bindings"
cd "../wasm"
yarn
yarn build


