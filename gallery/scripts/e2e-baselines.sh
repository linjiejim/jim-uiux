#!/usr/bin/env bash
# Makes the screenshot baselines in the Playwright image CI uses, so pixels match.
# The repo is copied into the container: your node_modules stay untouched.
set -euo pipefail
cd "$(dirname "$0")/../.."
IMAGE="mcr.microsoft.com/playwright:v$(node -p 'require("./gallery/package.json").devDependencies["@playwright/test"]')-noble"
mkdir -p gallery/e2e/__screenshots__
docker run --rm --platform linux/amd64 --ipc=host \
  -v "$PWD":/src:ro -v "$PWD/gallery/e2e/__screenshots__":/out \
  "$IMAGE" bash -c '
    set -e
    mkdir /w && cd /src && tar --exclude=./gallery/node_modules --exclude=./.git -cf - . | tar -xf - -C /w
    cd /w/gallery && corepack enable >/dev/null && CI=1 pnpm install --frozen-lockfile >/dev/null
    rm -rf e2e/__screenshots__
    CI=1 pnpm exec playwright test visual --update-snapshots=all --reporter=list
    rm -rf /out/* && cp -r e2e/__screenshots__/. /out/'
