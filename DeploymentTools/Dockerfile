# use the node argon image as base
FROM node:argon

# Set the Vorlon.JS Docker Image maintainer
MAINTAINER Julien Corioland (Microsoft, DX)

# update apt get and install unzip
RUN apt-get -qq update && apt-get -qqy install unzip

# Create the application directory
RUN mkdir -p /usr/src/vorlonjs

# Set app root as working directory
WORKDIR /usr/src/vorlonjs

# Expose port 1337
EXPOSE 1337

# Run Vorlon.JS
CMD ["npm", "start"]

# Send the app content to the container
COPY deployment-package.zip /usr/src/vorlonjs

# Extract the archive
RUN unzip deployment-package.zip -d /usr/src/vorlonjs && rm deployment-package.zip