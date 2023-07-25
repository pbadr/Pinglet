FROM node:18

COPY package.json .

RUN npm install
RUN npm run build

COPY build .
COPY socket-server .

CMD ["node", "./socket-server"]