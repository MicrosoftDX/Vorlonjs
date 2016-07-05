#!/bin/bash

# get version from package.json
appVersion=$(cat package.json | jq -r '.version')

# run the docker build command to create the Docker image
echo "Building Docker Vorlon.JS image version $appVersion"
docker build -t vorlonjs/dashboard:$appVersion .

# run the docker login command to authenticate to the Docker Hub
echo "Logging into the Docker Hub. Account is : $1"
docker login --username="$1" --password="$2"

# run the docker push command to push the new image to the hub
echo "Pushing the new Vorlon.JS image to the Docker Hub"
docker push vorlonjs/dashboard:$appVersion

# run the docker logout command to logout from the Docker Hub
echo "Logging out from the Docker Hub"
docker logout

echo "The image vorlonjs/dashboard:$appVersion has been pushed successfuly to the Docker Hub"
exit 0