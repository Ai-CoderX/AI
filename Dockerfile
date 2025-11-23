FROM node:18-buster

USER root
RUN apt-get update && \
    apt-get install -y ffmpeg webp imagemagick && \
    apt-get upgrade -y && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install --force

COPY . .

EXPOSE 7860

CMD ["npm", "start"]
