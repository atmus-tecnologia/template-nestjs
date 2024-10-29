# Use the Node.js base image
FROM public.ecr.aws/docker/library/node:20.17.0-alpine3.20

# Default environment arguments
ARG APP_ENV="development"
ARG NODE_ENV="development"
ARG WORK_DIR="/home/node/app"
ARG PORT="3000"
ARG HOST="0.0.0.0"

# Set default environment variables
ENV NODE_ENV=$NODE_ENV
ENV WORK_DIR=$WORK_DIR
ENV PORT=$PORT
ENV HOST=$HOST
ENV NODE_OPTIONS="--max-old-space-size=8192"
ENV TZ="America/Sao_Paulo"

# Create and set permissions for the application directory
RUN mkdir -p $WORK_DIR && chown node:node $WORK_DIR

# Set the working directory
WORKDIR $WORK_DIR

# Install PM2 and PNPM globally
RUN npm install pm2@latest pnpm@latest -g

# Copy package files separately to take advantage of Docker's cache
COPY --chown=node:node ./package*.json ./pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm i --frozen-lockfile --ignore-scripts

# Copy the remaining application files
COPY --chown=node:node . .

# Build the application
RUN pnpm build

# Expose the application port
EXPOSE $PORT

# Add a healthcheck to monitor container's health
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 CMD curl -f http://localhost:$PORT/health || exit 1

# Start the application using PM2
CMD [ "pm2-runtime", "start", "ecosystem.config.js" ]
