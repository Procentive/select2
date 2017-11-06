#!/usr/bin/env bash

set -e
set -o pipefail
cd "${0%/*}"

# build intended for a CI environment that can run bash, git, and of course npm.

npm run build

# Safeguard against forgetting to build before testing, and ensure against failure to submit build artifacts (required by bower).
if [ ! -z "$(git status -s -- dist/)" ]
then
    echo 'ci.bash: This build changed a file. Please ensure you configure your environment to use only Unix-style line endings, 
    and remember to commit changes to the dist directory.'
    echo 'git status says'
    git status
    echo 'git diff says'
    git diff
    exit 1
fi
