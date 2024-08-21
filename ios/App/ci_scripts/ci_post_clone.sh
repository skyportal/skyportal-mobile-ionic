#!/bin/sh

#  Scriptci_pre_xcodebuild.sh
#  App
#
#  Created by Joël DIBASSO on 8/21/24.
#  

echo "Pre-build"
brew install node
npm ci
npm run build
npx cap sync ios || { npx cap add ios; npx cap sync ios; }
