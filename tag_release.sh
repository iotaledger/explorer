#!/bin/bash

# Read target version from command line
TARGET_VERSION=$1
CURRENT_VERSION=$(sed -n 's/.*"version": "\([^"]*\)".*/\1/p' package.json)

if [[ -z $TARGET_VERSION ]]; then
    echo "Current version (root) is v$CURRENT_VERSION"
    read -p "Please specify target version: " TARGET_VERSION
    read -n 1 -p "Confirm version change 'v$CURRENT_VERSION' -> 'v$TARGET_VERSION' ? (Enter): " CONFIRM_VERSION

    if [[ $CONFIRM_VERSION != "" ]]; then
        echo "Aborting..."
        exit 1
    fi
else
    echo "Target version: v$TARGET_VERSION"
fi

echo "Bumping version in package.json..."
sed -i.bak "4s/version\": \"\(.*\)\"/version\": \"$TARGET_VERSION\"/g" package.json
rm package.json.bak

echo "Bumping version in api/package.json..."
cd "./api"
sed -i.bak "4s/version\": \"\(.*\)\"/version\": \"$TARGET_VERSION\"/g" package.json
rm package.json.bak

echo "Bumping version in client/package.json..."
cd "../client"
sed -i.bak "4s/version\": \"\(.*\)\"/version\": \"$TARGET_VERSION\"/g" package.json
rm package.json.bak
cd "../"

read -n 1 -p "Confirm making a bump commit and tagging with 'v$TARGET_VERSION' ? (Enter): " CONFIRM_BUMP

if [[ $CONFIRM_BUMP != "" ]]; then
    echo "Aborting..."
    exit 1
fi

cd "./api"
npm i
cd "../client"
npm i
cd "../"

echo "Making a bump commit..."
files_to_add=("package.json" "package-lock.json")
folders_to_add=("." "api" "client")
for folder in "${folders_to_add[@]}"
do
    for file in "${files_to_add[@]}"
    do
        git add "$folder/$file"
    done
done

git commit -S -m "chore: bump version to v$TARGET_VERSION"

echo "Tagging commit with 'v$TARGET_VERSION'..."
git tag v$TARGET_VERSION

read -n 1 -p "Do you want to push branch and tags ? (Enter): " CONFIRM_PUSH
if [[ $CONFIRM_PUSH != "" ]]; then
    echo "Exiting without pushing..."
    exit 1
fi

echo "Pushing branch and tags..."
# git push
# git push --tags
echo "Done!"

