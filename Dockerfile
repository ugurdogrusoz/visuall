#FROM nginx:1.15.8-alpine
#COPY ./ng-visuall usr/share/nginx/html/
#EXPOSE 80
#CMD ["nginx", "-g", "deamon off;"]

FROM node:12-alpine  As builder

ENV http_proxy http://pindigof:isteam123*@proxyde-rd.huawei.com:8080
ENV https_proxy http://pindigof:isteam123*@proxyde-rd.huawei.com:8080

RUN set -xe \
    && apk add --no-cache bash git openssh \
    && npm install -g npm \
    && git --version && bash --version && ssh -V && npm -v && node -v && yarn -v

WORKDIR /usr/src/app

RUN git config --global http.sslVerify false

RUN git clone --single-branch --branch Htrdc-Recommendation-and-Services https://d6b917e28aaec01f5f817cac57316a0ba04fc44d@github.com/ugurdogrusoz/visuall.git

WORKDIR /usr/src/app/visuall

RUN npm install

RUN npm run build --prod

FROM nginx:1.15.8-alpine

COPY --from=builder /usr/src/app/visuall/dist/ng-visuall/. /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "deamon off;"]
