#!/usr/bin/env bash
# Makes the screenshot baselines in the Playwright image CI uses, so pixels match.
# The repo is copied into the container: your node_modules stay untouched.
set -euo pipefail
cd "$(dirname "$0")/../.."
IMAGE="mcr.microsoft.com/playwright:v$(node -p 'require("./gallery/package.json").devDependencies["@playwright/test"]')-noble"
mkdir -p gallery/e2e/__screenshots__
# A proxy on this Mac's loopback (127.0.0.1:7890) is the host's address from inside the container.
proxy=()
for v in HTTP_PROXY HTTPS_PROXY http_proxy https_proxy; do
  val="${!v:-}"
  [ -n "$val" ] && proxy+=(-e "$v=$(printf '%s' "$val" | sed -E 's#//(127\.0\.0\.1|localhost)#//host.docker.internal#')")
done
docker run --rm --platform linux/amd64 --ipc=host ${proxy[@]+"${proxy[@]}"} -e NO_PROXY=localhost,127.0.0.1,::1 -e no_proxy=localhost,127.0.0.1,::1 \
  -v "$PWD":/src:ro -v "$PWD/gallery/e2e/__screenshots__":/out \
  "$IMAGE" bash -c '
    set -e
    mkdir /w && cd /src && tar --exclude=./gallery/node_modules --exclude=./.git -cf - . | tar -xf - -C /w
    cd /w/gallery
    # the image has no corepack: install the pnpm version package.json pins
    npm install -g --loglevel=error "$(node -p "require(\"./package.json\").packageManager")" >/dev/null
    CI=1 pnpm install --frozen-lockfile >/dev/null
    rm -rf e2e/__screenshots__
    CI=1 pnpm exec playwright test visual --update-snapshots=all --reporter=list
    rm -rf /out/* && cp -r e2e/__screenshots__/. /out/'
