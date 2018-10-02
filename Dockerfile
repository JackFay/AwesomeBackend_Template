FROM node:carbon

RUN git clone https://jrfay08:4f6c37fc7eee09b48644d0235d61c29cbf827657@github.com/JackFay/AwesomeProjectBackend /app/

WORKDIR /app

RUN npm install

EXPOSE 8080

CMD ["npm", "run", "dev"]
