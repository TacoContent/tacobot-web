#! /usr/bin/env bash

docker build -t tacobot-web:local .

docker run --rm -it -p 3000:3000 --env-file ./app/.env.prod --name nus tacobot-web:local