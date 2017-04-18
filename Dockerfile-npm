# use the node argon (4.4.3) image as base
FROM node:argon

# Set the Vorlon.JS Docker Image maintainer
MAINTAINER Julien Corioland (Microsoft, DX)

# Expose port 1337
EXPOSE 1337

# Upgrade to last NPM version
RUN npm upgrade -g npm

# Install Vorlonjs
RUN npm install -g vorlon@0.5.4

# Set the entry point
ENTRYPOINT ["vorlon"]