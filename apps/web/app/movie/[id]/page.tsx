import { movies } from "@/lib/data"
import MoviePage from "@/components/movie/MoviePage"

export default function Page({ params }: { params: { id: string } }) {
    const movie = movies.find(m => m.id === params.id)!
    return <MoviePage movie={movie} />
}