# Stage step
FROM node:22-alpine as builder

# Install work app in container and copy package.json and yarn.lock
WORKDIR /app
COPY package.json yarn.lock ./

# Install dependencies + DEV dependencies
RUN yarn install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Set the environment variable for the API URL
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Build the application -> /dist folder will be created
RUN yarn build

# Runner stage
FROM node:22-alpine as runner

RUN addgroup --system appgroup && adduser --system appuser -G appgroup

WORKDIR /app

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/yarn.lock ./yarn.lock
COPY --from=builder /app/public ./public

USER appuser

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]