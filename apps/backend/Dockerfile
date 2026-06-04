FROM node:22

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

EXPOSE 3000 5555

CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma studio --port 5555 --browser none & npm run start:prod"]