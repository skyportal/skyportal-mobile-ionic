#!/bin/sh

#  ci_pre_xcodebuild.sh
#  App
#
#  Created by Joël DIBASSO on 8/21/24.
#  

echo "Ionic Build"
cd ../../..
brew install node cocoapods
npm ci
npm run build
npx cap sync ios
