FROM public.ecr.aws/lambda/nodejs:18
SHELL ["bash", "-c"]

RUN yum install -y git curl unzip sqlite3 locales

COPY package.json package.json
RUN npm i aws-serverless-express
RUN npm i --omit=dev

COPY create.sql .
RUN mkdir db && sqlite3 db/database.sqlite < create.sql
RUN curl -sL -O https://www.post.japanpost.jp/zipcode/dl/kogaki/zip/ken_all.zip \
 && zcat ken_all.zip | iconv -f sjis -t utf8 | sqlite3 -separator , db/database.sqlite ".import /dev/stdin ken"
RUN sqlite3 db/database.sqlite "SELECT * FROM ken WHERE postal_code7 like '534002%' limit 2 offset 2"

COPY index.js .
COPY lambda.js .
COPY app app
COPY docs docs
COPY config config

CMD ["lambda.handler"]
