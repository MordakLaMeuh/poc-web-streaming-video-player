#!/bin/bash
mkdir -p ../ressources/website
cp -v index.* ../ressources/website
cd js
./build.sh
cd ..
cp -rv js ../ressources/website
exit 0
