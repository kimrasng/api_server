# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.13.1

FROM node:${NODE_VERSION}-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy the rest of the application source code
COPY . .

# Expose the port that the application listens on
EXPOSE 3000

# Run the application
CMD ["npm", "start"]
