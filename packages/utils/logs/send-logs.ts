// Kafka logging disabled — no-op until Kafka is re-enabled
export async function sendLog(_: {
  type?: "info" | "error" | "warning" | "success" | "debug";
  message: string;
  source?: string;
}) {
  // noop
}
