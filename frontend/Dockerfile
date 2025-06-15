FROM node:20.19.0

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . ./

USER node  

EXPOSE 3000

CMD ["npm", "start"]