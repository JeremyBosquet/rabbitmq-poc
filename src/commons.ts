import * as amqp from 'amqp-connection-manager';
import dayjs from "dayjs";

// CONSTANTS

export const MAX_RETRY = 3;

export const RABBIT_QUEUES = {
  B_EMAIL_SEND_EMAIL_BEMAIL: 'my-email-send-email-bemail',
  B_EMAIL_SEND_EMAIL_BORDER: 'my-email-send-email-border',
}
export const RABBIT_EXCHANGE = {
  MY_EXCHANGE: 'my-exchange',
  MY_DEAD_LETTER_EXCHANGE: 'my-dead-letter-exchange',
}


// Utils
export const logEvent = (msg: string) => {
  console.log(`[${dayjs().format('HH:mm:ss DD-MM-YYYY')}] [RabbitMQ] ${msg}`);
}

// RabbitMQ

export const rabbitMQCreateDeadExchange = async (channel: amqp.Channel) => {
  return channel.assertExchange(RABBIT_EXCHANGE.MY_DEAD_LETTER_EXCHANGE, 'topic', {
    autoDelete: false,
    durable: true,
    passive: true,
  });
};

export const rabbitMQCreateMyExchange = async (channel: amqp.Channel) => {
  return channel.assertExchange(RABBIT_EXCHANGE.MY_EXCHANGE, 'x-delayed-message', {
    autoDelete: false, 
    durable: true, 
    passive: true, 
    arguments: {'x-delayed-type':  "direct"}
  });
};

export const handleMessage = async ({channelWrapper, msg, executeFunction}) => {
  const msgContent = JSON.parse(msg.content);
  const retryCount = msg.properties.headers['retry-count'] || 0;
  if (retryCount >= MAX_RETRY) {
    await channelWrapper.publish(RABBIT_EXCHANGE.MY_DEAD_LETTER_EXCHANGE, `${msg.fields.routingKey}-dead-letter`, msgContent, {
      persistent: true,
    });
    logEvent(`Message is dead, ${msg.fields.routingKey} sent to dead letter exchange`);
    channelWrapper.ack(msg);
    return;
  }
  try {
    logEvent(`Received message from ${msg.fields.routingKey}, sent to function: '${executeFunction.name}'`);
    executeFunction(msgContent);
    channelWrapper.ack(msg);
  } catch (error) {
    // console.log(error)
    const delay = ((retryCount + 1) * Math.pow(2, retryCount)) * 10000; // 10, 40, 120 seconds
    await channelWrapper.publish(msg.fields.exchange, msg.fields.routingKey, msgContent, {
      headers: {
        'retry-count': retryCount + 1,
        'x-delay': delay,
      },
      persistent: true,
    })

    logEvent(`Failed message from ${msg.fields.routingKey}, retry in ${delay}ms`)
    channelWrapper.ack(msg);
  }
}

interface IRabbitMQAddListenQueue {
  channelWrapper: amqp.ChannelWrapper;
  channel: amqp.Channel;
  queue: string;
  executeFunction: Function;
}
export const rabbitMQAddListenQueue = async ({channelWrapper, channel, queue, executeFunction}: IRabbitMQAddListenQueue) => {
  await channel.assertQueue(queue, { 
    durable: true,
    arguments: {
      'x-dead-letter-exchange': RABBIT_EXCHANGE.MY_DEAD_LETTER_EXCHANGE,
    },
  });
  await channel.bindQueue(queue, RABBIT_EXCHANGE.MY_EXCHANGE, queue);
  await channel.consume(queue, (msg) => handleMessage({channelWrapper, msg, executeFunction}), { noAck: false });
  logEvent(`Listening to queue: ${queue} in exchange: ${RABBIT_EXCHANGE.MY_EXCHANGE}`);
};

export const rabbitMQAddListenQueueDeadLetter = async ({channelWrapper, channel, queue, executeFunction}: IRabbitMQAddListenQueue) => {
  queue = queue === '#' ? '#' : `${queue}-dead-letter`;
  await channel.assertQueue(queue, { 
    durable: true,
  });
  await channel.bindQueue(queue, RABBIT_EXCHANGE.MY_DEAD_LETTER_EXCHANGE, queue);
  await channel.consume(queue, (msg) => handleMessage({channelWrapper, msg, executeFunction}), { noAck: false });
  logEvent(`Listening to queue: ${queue} in exchange: ${RABBIT_EXCHANGE.MY_EXCHANGE}`);
};

export const publishQueueWithExchange = async (exchange: string, queue: string, content: any, delay: number = 0) => {
  try {
    await channelWrapper.publish(exchange, queue, content, {
      // @ts-expect-error error in types
      headers: {
        'retry-count': 0,
        'x-delay': delay || 0,
      },
      persistent: true,
    })
  } catch (error) {
    console.log('[RabbitMQ] Failed to publish message', error)
  }
}

// RabbitMQ Connection
const conn = amqp.connect(['amqp://localhost']);

export const channelWrapper: amqp.ChannelWrapper = conn.createChannel({
  json: true,
  setup: (channel: amqp.Channel) => {
    return Promise.all([
      rabbitMQCreateMyExchange(channel),
      rabbitMQCreateDeadExchange(channel),
    ]);
  }
});
