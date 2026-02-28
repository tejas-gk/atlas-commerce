import { Kafka } from "kafkajs";

export const kafka = new Kafka({
  clientId: "hyagriva",
  brokers: ["pkc-921jm.us-east-2.aws.confluent.cloud:9092"],
  ssl: true,
  sasl: {
    mechanism: "plain",
    username: "T5BYR6B6GYDXHE5J",
    password: "cflta3DXgI954T22Mr4657Te7Pc/Gx5hs06YMYXqGmv9W6GYuIdFQXNcWrs3hvAg"
  }, connectionTimeout: 10000,
  authenticationTimeout: 10000,
  requestTimeout: 30000,
  retry: {
    initialRetryTime: 300,
    retries: 5,
  },
});
