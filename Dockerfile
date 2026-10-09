FROM node:20-bookworm-slim
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
RUN if [ -f bot/package.json ]; then cd bot && npm install --omit=dev; fi
ENV NODE_ENV=production
CMD ["npm", "start"]
