import { SeatPicker } from "@/components/movie/seat-picker"

export default async function SeatsPage({
  searchParams,
}: {
  searchParams: Promise<{ time?: string }>
}) {
  const { time } = await searchParams
  return <SeatPicker showtime={time || "06:10 PM"} />
}
