import { theatreMovies } from "@/lib/data"
import { notFound } from "next/navigation"
import { MovieShowtimes } from "./movie-showtimes"

export default async function MovieDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const movie = theatreMovies.find((m) => m.id === id)

    if (!movie) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-background">
            {/* <Navbar /> */}
            <MovieShowtimes movie={movie} />
        </div>
    )
}
