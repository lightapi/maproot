#!/bin/bash
echo "Build the view in in prod mode"
yarn build-prd
echo "Build completed in build folder, start copying to remote prod2 server"
ssh prod2 "rm -rf ~/networknt/light-config-prod/prod2/maproot/build"
scp -r ./build prod2:/home/steve/networknt/light-config-prod/prod2/maproot
echo "Copied!"
