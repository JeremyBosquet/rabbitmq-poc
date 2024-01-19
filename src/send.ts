
import { RABBIT_EXCHANGE, RABBIT_QUEUES, publishQueueWithExchange } from './commons';

// const publishRetry: {exchange: string, queue: string, content: any}[] = [];

(async () => {
  // setInterval(() => {
    publishQueueWithExchange(RABBIT_EXCHANGE.MY_EXCHANGE, RABBIT_QUEUES.B_EMAIL_SEND_EMAIL_BEMAIL, { email: 'email' });
    publishQueueWithExchange(RABBIT_EXCHANGE.MY_EXCHANGE, RABBIT_QUEUES.B_EMAIL_SEND_EMAIL_BORDER, { emailOrder: 'email' });

    // if (publishRetry.length > 0) {
    //   for (const retry of publishRetry) {
    //     publishQueueWithExchange(retry.exchange, retry.queue, retry.content);
    //     publishRetry.splice(publishRetry.indexOf(retry), 1);
    //   }
    // }
  // }, 2000)
})()


