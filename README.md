# RABBITMQ POC

## Description

POC sur RabbitMQ utilisant des microservices avec plusieurs ReplicaSets. Sur 3 instances du même service, seul l'une d'entre elles doit traiter le message. En cas d'erreur, le message est réessayé 3 fois avec un délai exponentiel. Après 3 tentatives infructueuses, le message est redirigé vers une "dead-letter", permettant d'identifier le problème et de signaler l'erreur.

Cette "dead-letter" fonctionne selon un modèle de Topic, offrant la possibilité de cibler une erreur sur une queue spécifique ou sur toutes les queues ayant échoué.

## Plugin for delaying messages

```https://github.com/rabbitmq/rabbitmq-delayed-message-exchange```

## Launch

```docker-compose up -d```

Using bun:

Launch receiver
```bun src/receive.ts```

Launch sender
```bun src/send.ts```

Launch receive poison messages
```bun src/receiveDeadLetter.ts```

Launch test with send and fail
```bun start```