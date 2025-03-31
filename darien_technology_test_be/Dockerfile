# Use Node.js 20 Alpine as the base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies required for bcrypt
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies with network retry options
RUN yarn config set network-timeout 300000 && \
    yarn config set registry https://registry.npmjs.org/ && \
    yarn install --frozen-lockfile --network-timeout 300000

# Copy the rest of the application code (excluding node_modules)
COPY . .

# Make sure the startup script is executable
RUN chmod +x /app/startup.sh

# Build the application
RUN yarn build

# Expose the port the app runs on
EXPOSE 3001

# Run the startup script
CMD ["/app/startup.sh"]