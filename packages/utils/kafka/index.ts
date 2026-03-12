import { Kafka } from "kafkajs";

export const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || "hyagriva",
  brokers: [process.env.KAFKA_BROKER || "pkc-921jm.us-east-2.aws.confluent.cloud:9092"],
  ssl: true,
  sasl: {
    mechanism: "plain",
    username: process.env.KAFKA_USERNAME!,
    password: process.env.KAFKA_PASSWORD!
  }, connectionTimeout: 10000,
  authenticationTimeout: 10000,
  requestTimeout: 30000,
  retry: {
    initialRetryTime: 300,
    retries: 5,
  },
});
