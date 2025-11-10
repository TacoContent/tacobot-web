#! pwsh

docker build -t tacobot-web:local .

docker run --rm -it -p 3000:3000 --env-file .env.prod --name tacobot-web tacobot-web:local