FROM node:lts-bullseye
SHELL ["bash", "-c"]
WORKDIR /home/node
ENV DEBIAN_FRONTEND noninteractive
RUN apt-get update && apt-get install -y locales curl git vim sqlite3 zip unzip \
    iproute2 dnsutils netcat \
    less tree jq python3-pip sudo
RUN rm -fr /var/lib/apt/lists/*
RUN usermod -aG sudo node && echo '%sudo ALL=(ALL:ALL) NOPASSWD:ALL' > /etc/sudoers.d/40-users
RUN sed -i -e 's/# ja_JP.UTF-8 UTF-8/ja_JP.UTF-8 UTF-8/' /etc/locale.gen && locale-gen && update-locale LANG=ja_JP.UTF-8 \
 && echo -e "export LANG=ja_JP.UTF-8\nexport TZ=Asia/Tokyo\numask u=rwx,g=rx,o=rx" | tee -a /etc/bash.bashrc
RUN chown -R node. /usr/local/lib/node_modules && chown -R :node /usr/local/bin && chmod -R g+w /usr/local/bin

USER node
RUN npm i --location=global npm && npm version | xargs
COPY --chown=node:staff create.sql .
RUN sqlite3 db < create.sql
RUN curl -sL -O https://www.post.japanpost.jp/zipcode/dl/kogaki/zip/ken_all.zip \
 && zcat ken_all.zip | iconv -f sjis -t utf8 | sqlite3 -separator , db ".import /dev/stdin ken"
RUN sqlite3 db "SELECT * FROM ken WHERE postal_code7 like '534002%' limit 2 offset 2"

COPY --chown=node:staff . .
RUN npm i --production

EXPOSE 3000
CMD ["npm", "start"]
