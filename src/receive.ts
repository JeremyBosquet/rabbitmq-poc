import * as amqp from 'amqp-connection-manager';
import { RABBIT_QUEUES, channelWrapper, rabbitMQAddListenQueue } from './commons';

const test = (data) => {
  console.log(data)
}
const jojotest = (data) => {
  console.log('jojo', data)
  // throw new Error('jojo')
}

channelWrapper.addSetup((channel: amqp.Channel) => {
  return Promise.all([
    rabbitMQAddListenQueue({channelWrapper: channelWrapper, channel, queue: RABBIT_QUEUES.B_EMAIL_SEND_EMAIL_BEMAIL, executeFunction: test}),
    rabbitMQAddListenQueue({channelWrapper: channelWrapper, channel, queue: RABBIT_QUEUES.B_EMAIL_SEND_EMAIL_BORDER, executeFunction: jojotest})
  ]);
})