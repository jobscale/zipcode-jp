FROM node:lts-bookworm-slim
SHELL ["bash", "-c"]
WORKDIR /home/node
ENV DEBIAN_FRONTEND noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends locales curl git vim sqlite3 unzip \
  iproute2 dnsutils netcat-openbsd \
  less tree jq python3-pip sudo \
 && apt-get clean && rm -fr /var/lib/apt/lists/*
RUN usermod -aG sudo node && echo '%sudo ALL=(ALL:ALL) NOPASSWD:ALL' > /etc/sudoers.d/40-users
RUN sed -i -e 's/# ja_JP.UTF-8 UTF-8/ja_JP.UTF-8 UTF-8/' /etc/locale.gen && locale-gen && update-locale LANG=ja_JP.UTF-8 \
 && echo -e "export LANG=ja_JP.UTF-8\nexport TZ=Asia/Tokyo\numask u=rwx,g=rx,o=rx" | tee -a /etc/bash.bashrc
RUN chown -R node. /usr/local/lib/node_modules \
 && chown -R :node /usr/local/bin && chmod -R g+w /usr/local/bin \
 && chown -R :node /usr/local/share && chmod -R g+w /usr/local/share

USER node
RUN npm version | xargs
COPY --chown=node:staff create.sql .
RUN mkdir db && sqlite3 db/database.sqlite < create.sql
RUN curl -sL -O https://www.post.japanpost.jp/zipcode/dl/kogaki/zip/ken_all.zip \
 && zcat ken_all.zip | iconv -f sjis -t utf8 | sqlite3 -separator , db/database.sqlite ".import /dev/stdin ken"
RUN sqlite3 db/database.sqlite "SELECT * FROM ken WHERE postal_code7 like '534002%' limit 2 offset 2"

COPY --chown=node:staff package.json .
RUN npm i --omit=dev
COPY --chown=node:staff index.js .
COPY --chown=node:staff app app
COPY --chown=node:staff docs docs
COPY --chown=node:staff config config

EXPOSE 3000
CMD ["npm", "start"]
