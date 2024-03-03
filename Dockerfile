FROM node


WORKDIR /usr/share/server

COPY package.json package.json
COPY package-lock.json package-lock.json

COPY . .
RUN npm install

EXPOSE 3000

CMD [ "node", "server.js" ]