import * as amqp from 'amqp-connection-manager';
import { RABBIT_QUEUES, channelWrapper, rabbitMQAddListenQueueDeadLetter } from './commons';

channelWrapper.addSetup((channel: amqp.Channel) => {
  return Promise.all([
    rabbitMQAddListenQueueDeadLetter({channelWrapper, channel, queue: RABBIT_QUEUES.B_EMAIL_SEND_EMAIL_BEMAIL, executeFunction: test}),
    rabbitMQAddListenQueueDeadLetter({channelWrapper, channel, queue: RABBIT_QUEUES.B_EMAIL_SEND_EMAIL_BORDER, executeFunction: test}),
    rabbitMQAddListenQueueDeadLetter({channelWrapper, channel, queue: '#', executeFunction: global}),
  ]);
});

const test = (data) => {
  console.log(data);
}
const global = (data) => {
  console.log('receive from global', data);
}
