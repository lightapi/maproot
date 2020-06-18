#!/bin/bash
echo "Build the view in in test mode"
yarn build-dev
echo "Build completed in build folder, start copying to remote test2 server"
ssh test2 "rm -rf ~/light-chain/light-config-test/test2/maproot/build"
scp -r ./build test2:/home/steve/light-chain/light-config-test/test2/maproot
echo "Copied!"
