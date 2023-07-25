FROM node:18

COPY package.json .

RUN npm install
RUN npm run build

COPY . .

CMD ["node", "./socket-server"]