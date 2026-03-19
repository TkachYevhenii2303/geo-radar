# Build stage
FROM node:22-alpine as builder

# Install work app in container
WORKDIR /app

# Copy package.json and yarn.lock and install dependencies -> Docker will cache this layer
# If we change package.json or yarn.lock, this layer will be rebuilt
COPY package.json yarn.lock ./

# Install dependencies + DEV dependencies
RUN yarn install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the application -> /dist folder will be created
RUN yarn build

# Runner stage
FROM node:22-alpine as runner

# Create a non-root user and group
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Set the working directory in the container
WORKDIR /app

# Copy the build artifacts from the builder stage (production dependencies only)
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/yarn.lock ./yarn.lock
COPY --from=builder /app/node_modules ./node_modules

# Set the user to the non-root user
USER appuser

# Expose the port the app will run on (docs, not firewall)
EXPOSE 8080

CMD ["node", "dist/main"]