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
