FROM keymetrics/pm2:latest-alpine

# Bundle APP files
# COPY src src/
COPY package.json .
COPY ecosystem.config.js .

# Install app dependencies
ENV NPM_CONFIG_LOGLEVEL warn
RUN npm install --production

# Bundle app source
COPY . .

# Expose the listening port of your app
EXPOSE 8081

# Show current folder structure in logs
RUN ls -al -R

CMD [ "pm2-runtime", "start", "ecosystem.config.js" ]