#!/bin/bash
SDK_DIR="iota-sdk"
TARGET_COMMIT="0694acfa2258fe3c28de2b88ea9c1a911de35051"

if [ ! -d "$SDK_DIR" ]; then
  git clone -b 2.0 git@github.com:iotaledger/iota-sdk.git
  cd "./$SDK_DIR"
else
  echo "Pulling nova-sdk..."
  cd "./$SDK_DIR"
  git reset --hard 2.0
  git pull
fi

echo "Checking out nova-sdk commit $TARGET_COMMIT"
git checkout "$TARGET_COMMIT"

cd "./bindings/nodejs"
echo "Renaming nodejs sdk (sdk-nova)"

# Sed way that works on both linux and macos
# https://stackoverflow.com/questions/5694228/sed-in-place-flag-that-works-both-on-mac-bsd-and-linux
sed -i.bak '2s/.*/    \"name\": \"@iota\/sdk-nova\",/' package.json
rm package.json.bak

echo "Building nodejs bindings"
yarn
yarn build

cd "../wasm"
echo "Renaming wask sdk (sdk-wasm-nova)"
sed -i.bak '2s/.*/    \"name\": \"@iota\/sdk-wasm-nova\",/' package.json
rm package.json.bak

echo "Building wasm bindings"
yarn
yarn build
