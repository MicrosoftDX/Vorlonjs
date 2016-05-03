# use the node argon (4.4.3) image as base
FROM node:argon

# Set the Vorlon.JS Docker Image maintainer
MAINTAINER Julien Corioland (Microsoft, DX)

# Expose port 1337
EXPOSE 1337

# Set the entry point
ENTRYPOINT ["npm", "start"]

# Create the application directory
RUN mkdir -p /usr/src/vorlonjs

# Copy the application content
COPY . /usr/src/vorlonjs/

# Set app root as working directory
WORKDIR /usr/src/vorlonjs

# Upgrade to last NPM version
RUN npm upgrade -g npm

# Install gulp
RUN npm install -g gulp

# Run npm install
RUN npm install

# Run gulp
RUN gulp