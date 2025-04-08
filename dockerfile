FROM node:16 as builder
WORKDIR /app

COPY package.json ./
#COPY public /app/public
COPY . .
RUN yarn install && \
    yarn build
#RUN npm install

#COPY . .

EXPOSE 5173
#CMD ["npm", "run", "dev"]
#RUN npm run build


FROM nginx:latest


COPY --from=builder /app/dist /usr/share/nginx/html
COPY public /usr/share/nginx/html
COPY .env /app/.env

COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY nginx/proxy.conf /etc/nginx/
ADD .docker/entrypoint.sh /init.sh
EXPOSE 80
ENTRYPOINT ["sh","/init.sh"]
#CMD ["nginx", "-g", "daemon off;"]
