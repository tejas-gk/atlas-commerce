"use server";
import { kafka } from "@atlas/kafka";

const producer = kafka.producer();

export async function sendKafkaEvent(eventData: {
  userId?: string;
  productId?: string;
  shopId?: string;
  action: string;
  device?: string;
  country?: string;
  city?: string;
}) {
  console.log("Sending Kafka event:", eventData);
  try {
    await producer.connect();
    await producer.send({
      topic: "user-events",
      messages: [{ value: JSON.stringify(eventData) }],
    });
  } catch (error) {
    console.log(error);
  } finally {
    await producer.disconnect();
  }
}
