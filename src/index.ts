import * as amqp from "amqp-connection-manager";
import { RABBIT_EXCHANGE, RABBIT_QUEUES, channelWrapper, publishQueueWithExchange, rabbitMQAddListenQueue, rabbitMQAddListenQueueDeadLetter } from "./commons";

channelWrapper.addSetup((channel: amqp.Channel) => {
  return Promise.all([
    rabbitMQAddListenQueue({channelWrapper: channelWrapper, channel, queue: RABBIT_QUEUES.B_EMAIL_SEND_EMAIL_BEMAIL, executeFunction: test}),
    rabbitMQAddListenQueueDeadLetter({channelWrapper, channel, queue: RABBIT_QUEUES.B_EMAIL_SEND_EMAIL_BEMAIL, executeFunction: deadtest})
  ]);
})

const test = (data) => {
  console.log(data)
  throw new Error('jojo')
};

const deadtest = (data) => {
  console.log('DEAD', data)
};

(async () => {
  publishQueueWithExchange(RABBIT_EXCHANGE.MY_EXCHANGE, RABBIT_QUEUES.B_EMAIL_SEND_EMAIL_BEMAIL, { email: 'email' });
})();