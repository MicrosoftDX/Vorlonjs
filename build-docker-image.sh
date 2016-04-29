#!/bin/bash

# get version from package.json
appVersion=$(cat package.json | jq -r '.version')
echo "Building Docker Vorlon.JS image version $appVersion"

echo "Building MusicStore Front Docker Image"
docker build -t vorlonjs:$appVersion .

docker login --username="$1" --password="$2"

echo "Pushing Front image..."
docker push vorlonjs:$appVersion

docker logout

exit 0