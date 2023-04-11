ARG FUNCTION_DIR="/var/task"

FROM node:16.14.2-bullseye as build-image
SHELL ["bash", "-c"]

ENV DEBIAN_FRONTEND noninteractive
RUN apt-get update \
 && apt-get install -y \
    g++ make cmake unzip libcurl4-openssl-dev \
    autoconf libtool python3-pip \
    git curl

ARG FUNCTION_DIR
WORKDIR ${FUNCTION_DIR}

COPY package.json package.json
RUN npm i aws-lambda-ric aws-serverless-express
RUN npm i --production

FROM node:16.14.2-bullseye-slim
SHELL ["bash", "-c"]

RUN apt-get update && \
    apt-get install -y \
    git curl unzip sqlite3 locales

ARG FUNCTION_DIR
WORKDIR ${FUNCTION_DIR}

COPY --chown=node:staff create.sql .
RUN mkdir db && sqlite3 db/database.sqlite < create.sql
RUN curl -sL -O https://www.post.japanpost.jp/zipcode/dl/kogaki/zip/ken_all.zip \
 && zcat ken_all.zip | iconv -f sjis -t utf8 | sqlite3 -separator , db/database.sqlite ".import /dev/stdin ken"
RUN sqlite3 db/database.sqlite "SELECT * FROM ken WHERE postal_code7 like '534002%' limit 2 offset 2"

COPY --from=build-image ${FUNCTION_DIR} .
COPY index.js .
COPY lambda.js .
COPY app app
COPY docs docs
COPY config config

ENTRYPOINT ["npx", "aws-lambda-ric"]
CMD ["lambda.handler"]
