FROM public.ecr.aws/lambda/nodejs:24
SHELL ["bash", "-c"]

RUN dnf install -y git curl-minimal unzip sqlite glibc-locale-source glibc-langpack-ja \
 && dnf clean all && rm -rf /var/cache/dnf \
 && localedef -i ja_JP -f UTF-8 ja_JP.UTF-8
ENV LANG=ja_JP.UTF-8

COPY package.json package.json
RUN npm i --omit=dev

COPY create.sql .
RUN mkdir db && sqlite3 db/database.sqlite < create.sql
RUN curl -sL -O https://www.post.japanpost.jp/service/search/zipcode/download/utf/zip/utf_ken_all.zip \
 && zcat utf_ken_all.zip | sqlite3 -separator , db/database.sqlite ".import /dev/stdin ken" \
 && rm utf_ken_all.zip
RUN sqlite3 db/database.sqlite "SELECT * FROM ken WHERE postal_code7 like '534002%' limit 2 offset 2"

COPY index.js .
COPY lambda.js .
COPY app app
COPY docs docs
COPY config config

CMD ["lambda.handler"]
