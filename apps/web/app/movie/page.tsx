import { HeroCarousel } from "@/components/hero-carousel"
import { MovieCard } from "@/components/movie-card"
import { MoviesFilterSection } from "@/components/movies-filter-section"
import Navbar from "@/components/navbar"

import { movies, theatreMovies } from "@/lib/data"

export default function HomePage() {
    return (
        <div className="min-h-screen bg-background">
            <HeroCarousel />
            <Navbar />

            <main className="mx-auto max-w-7xl px-4 py-8">
                {/* Recommended Movies */}
                <section>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                        {movies.map((movie) => (
                            <MovieCard key={movie.id} movie={movie} />
                        ))}
                    </div>
                </section>

                {/* Only in Theatres */}
                <section className="mt-10">
                    <h2 className="mb-4 text-2xl font-bold text-foreground">Only in Theatres</h2>
                    <MoviesFilterSection />
                    <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                        {theatreMovies.map((movie) => (
                            <MovieCard key={movie.id} movie={movie} />
                        ))}
                    </div>
                </section>
            </main>
        </div>
    )
}
