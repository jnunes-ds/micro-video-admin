#!/bin/bash

set -e

npm install --legacy-peer-deps
npm rebuild sqlite3 --build-from-source

tail -f /dev/null