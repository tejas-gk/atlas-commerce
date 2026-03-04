import { events } from "@/lib/data"
import EventPage from "@/components/event/EventPage"

export default function Page({ params }: { params: { id: string } }) {
    const event = events.find(e => e.id === params.id)!
    return <EventPage event={event} />
}