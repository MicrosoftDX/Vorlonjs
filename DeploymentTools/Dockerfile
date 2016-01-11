# use the node argon image as base
FROM node:argon

# Set the Vorlon.JS Docker Image maintainer
MAINTAINER Julien Corioland (Microsoft, DX)

RUN apt-get -qq update && apt-get -qqy install unzip

# Create the application directory
RUN mkdir -p /usr/src/vorlonjs

# Set app root as working directory
WORKDIR /usr/src/vorlonjs

# Send the app content to the container
COPY deployment-package.zip /usr/src/vorlonjs

# Extract the archive
RUN unzip deployment-package.zip -d /usr/src/vorlonjs

# Remove the archive
RUN rm deployment-package.zip

# Expose port 1337
EXPOSE 1337

# Run Vorlon.JS
CMD ["npm", "start"]