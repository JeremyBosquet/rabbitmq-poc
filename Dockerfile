FROM rabbitmq:3-management-alpine

COPY ./rabbitmq-enable-plugins/* /plugins

RUN rabbitmq-plugins enable rabbitmq_delayed_message_exchange