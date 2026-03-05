export interface Movie {
    id: string
    title: string
    year?: string
    rating: string
    language: string
    languages?: string
    genre?: string
    duration?: string
    poster: string
    isNew?: boolean
}

export interface Theater {
    id: string
    name: string
    distance: string
    cancellable: boolean
    logo: string
    showtimes: Showtime[]
}

export interface Showtime {
    time: string
    format?: string
}

export interface SeatCategory {
    name: string
    price: number
    rows: SeatRow[]
}

export interface SeatRow {
    label: string
    seats: Seat[][]
}

export interface Seat {
    number: number
    available: boolean
}

export interface Event {
    id: string
    title: string
    date: string
    time: string
    venue: string
    location: string
    distance: string
    gateTime: string
    price: number
    description: string
    images: string[]
    highlights: string[]
}

export interface Venue {
    id: string
    name: string
    category: string
    address: string
    image: string
    description: string
    fullDescription: string
}

export const movies: Movie[] = [
    {
        id: "f1-the-movie",
        title: "F1 The Movie (2025)",
        rating: "UA16+",
        language: "English",
        poster: "/placeholder.svg?height=400&width=280",
    },
    {
        id: "sinners",
        title: "Sinners (2025)",
        rating: "A",
        language: "English",
        poster: "/placeholder.svg?height=400&width=280",
    },
    {
        id: "marty-supreme",
        title: "Marty Supreme",
        rating: "A",
        language: "English",
        poster: "/placeholder.svg?height=400&width=280",
    },
    {
        id: "zootopia-2",
        title: "Zootopia 2 (2025)",
        rating: "UA7+",
        languages: "English and 1 more",
        language: "English",
        poster: "/placeholder.svg?height=400&width=280",
    },
    {
        id: "one-battle-after-another",
        title: "One Battle After Another (2025)",
        rating: "A",
        language: "English",
        poster: "/placeholder.svg?height=400&width=280",
    },
]

export const theatreMovies: Movie[] = [
    {
        id: "kerala-story-2",
        title: "The Kerala Story 2",
        rating: "UA16+",
        language: "Hindi",
        poster: "/placeholder.svg?height=400&width=280",
    },
    {
        id: "o-romeo",
        title: "O Romeo",
        rating: "A",
        language: "Hindi",
        poster: "/placeholder.svg?height=400&width=280",
    },
    {
        id: "assi",
        title: "Assi",
        rating: "A",
        language: "Hindi",
        duration: "2 hr 13 min",
        poster: "/placeholder.svg?height=400&width=280",
    },
    {
        id: "viyaah-kartaare-da",
        title: "Viyaah Kartaare Da",
        rating: "UA",
        language: "Punjabi",
        poster: "/placeholder.svg?height=400&width=280",
    },
    {
        id: "tere-naam",
        title: "Tere Naam (2003)",
        rating: "A",
        language: "Hindi",
        poster: "/placeholder.svg?height=400&width=280",
    },
    {
        id: "mardaani-3",
        title: "Mardaani 3",
        rating: "UA16+",
        language: "Hindi",
        poster: "/placeholder.svg?height=400&width=280",
    },
]

export const heroSlides = [
    {
        title: "The Kerala Story 2 Goes Beyond",
        rating: "UA16+",
        genre: "Drama, Social",
        image: "/placeholder.svg?height=400&width=300",
        bgColor: "from-red-900/80 to-red-800/60",
    },
    {
        title: "F1 The Movie",
        rating: "UA16+",
        genre: "Action, Drama",
        image: "/placeholder.svg?height=400&width=300",
        bgColor: "from-gray-900/80 to-gray-800/60",
    },
]

export const theaters: Theater[] = [
    {
        id: "cinepolis-grand-view",
        name: "Cinepolis Grand View High Street, Gurugram",
        distance: "1.6 km away",
        cancellable: false,
        logo: "cinepolis",
        showtimes: [{ time: "06:10 PM" }],
    },
    {
        id: "inox-world-mark",
        name: "INOX World Mark, Sector 65, Gurugram",
        distance: "4.4 km away",
        cancellable: true,
        logo: "inox",
        showtimes: [
            { time: "03:55 PM", format: "LASER" },
            { time: "09:50 PM", format: "LASER" },
        ],
    },
    {
        id: "wave-cinemas",
        name: "Wave Cinemas, Gurugram",
        distance: "5.3 km away",
        cancellable: true,
        logo: "wave",
        showtimes: [{ time: "10:00 PM", format: "LASER" }],
    },
    {
        id: "inox-ardee-mall",
        name: "INOX Gurugram Ardee Mall, Ardee City, Gurugram",
        distance: "5.4 km away",
        cancellable: true,
        logo: "inox",
        showtimes: [
            { time: "04:15 PM", format: "LASER" },
            { time: "10:30 PM", format: "LASER" },
        ],
    },
]

export function generateSeatLayout(): SeatCategory[] {
    const makeSeatGroup = (numbers: number[], unavailableSeats: number[] = []): Seat[] =>
        numbers.map((n) => ({ number: n, available: !unavailableSeats.includes(n) }))

    return [
        {
            name: "VIP",
            price: 350,
            rows: [
                {
                    label: "J",
                    seats: [
                        makeSeatGroup([1, 2]),
                        makeSeatGroup([3, 4]),
                        makeSeatGroup([5, 6]),
                        makeSeatGroup([7, 8]),
                        makeSeatGroup([9, 10]),
                        makeSeatGroup([11, 12]),
                    ],
                },
            ],
        },
        {
            name: "PREMIUM",
            price: 170,
            rows: [
                {
                    label: "I",
                    seats: [
                        makeSeatGroup([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]),
                        makeSeatGroup([15, 16]),
                    ],
                },
                {
                    label: "H",
                    seats: [
                        makeSeatGroup([1, 2, 3, 4]),
                        makeSeatGroup([5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]),
                        makeSeatGroup([17, 18, 19]),
                    ],
                },
                {
                    label: "G",
                    seats: [
                        makeSeatGroup([1, 2, 3, 4]),
                        makeSeatGroup([5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]),
                        makeSeatGroup([17, 18, 19]),
                    ],
                },
                {
                    label: "F",
                    seats: [
                        makeSeatGroup([1, 2, 3, 4]),
                        makeSeatGroup([5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]),
                        makeSeatGroup([17, 18, 19]),
                    ],
                },
                {
                    label: "E",
                    seats: [
                        makeSeatGroup([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], [1, 2, 3, 4, 5, 6]),
                        makeSeatGroup([13, 14, 15]),
                    ],
                },
            ],
        },
        {
            name: "EXECUTIVE",
            price: 150,
            rows: [
                {
                    label: "D",
                    seats: [
                        makeSeatGroup([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]),
                        makeSeatGroup([13, 14, 15]),
                    ],
                },
                {
                    label: "C",
                    seats: [
                        makeSeatGroup([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]),
                        makeSeatGroup([13, 14, 15]),
                    ],
                },
                {
                    label: "B",
                    seats: [
                        makeSeatGroup([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]),
                        makeSeatGroup([13, 14, 15]),
                    ],
                },
            ],
        },
    ]
}

export const shakiraEvent: Event = {
    id: "shakira-concert",
    title: "Feeding India Concert 2026 ft. Shakira | Delhi",
    date: "Wed, 15 Apr",
    time: "4:00 PM",
    venue: "Jawaharlal Nehru Stadium, New Delhi",
    location: "New Delhi",
    distance: "22.6 km away",
    gateTime: "Gates open at 3 PM",
    price: 4500,
    description: `The Feeding India Concert returns in 2026 - bigger, bolder, and more unforgettable than ever.

Touring for the first time ever in India - Shakira.

This groundbreaking concert experience brings together world-class performances with a meaningful cause. Every ticket purchased helps support Feeding India's mission to end hunger across the nation.

Join thousands of music lovers for an evening of spectacular live performances, stunning visual productions, and unforgettable memories at the iconic Jawaharlal Nehru Stadium.`,
    images: [
        "/placeholder.svg?height=400&width=600",
        "/placeholder.svg?height=300&width=300",
        "/placeholder.svg?height=200&width=200",
        "/placeholder.svg?height=200&width=200",
        "/placeholder.svg?height=300&width=300",
        "/placeholder.svg?height=300&width=400",
    ],
    highlights: [
        "International headliner performance",
        "State-of-the-art sound & production",
        "Food & beverage zones",
        "VIP & VVIP experiences",
        "Supports Feeding India's mission",
    ],
}

export const championsVenue: Venue = {
    id: "champions-cave",
    name: "Champions Cave Box Cricket",
    category: "Play",
    address: "Champion's Cave One7 Box Cricket Arena, Gurugram",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-dLuzrc22O1vd9i7wbk5GpTKRkJsx1F.png",
    description:
        "Champion's Cave is one of the largest box cricket arenas in Gurgaon. Equipped with bowling machine practice lanes, it caters to players of all levels \u2014 whether you're training for a tournament or enjoying a casual match with friends. It offers a convenient, high-quality space for cricket enthusiasts to play and...",
    fullDescription:
        "Champion's Cave is one of the largest box cricket arenas in Gurgaon. Equipped with bowling machine practice lanes, it caters to players of all levels \u2014 whether you're training for a tournament or enjoying a casual match with friends. It offers a convenient, high-quality space for cricket enthusiasts to play and practice. The arena features professional-grade turf, LED lighting for evening games, and a comfortable waiting area for spectators. Whether you're planning a corporate event, a birthday celebration, or just a weekend game with friends, Champion's Cave provides the perfect setting for an exciting cricket experience.",
}

export const navItems = [
    { label: "For you", href: "/" },
    { label: "Movies", href: "/movies" },
    { label: "Events", href: "/events/shakira-concert" },
    { label: "Stores", href: "/stores" },
    { label: "Play", href: "/play/champions-cave" },
]

export const timeSlots = [
    { id: "morning", label: "6:00 AM - 9:00 AM", price: 800 },
    { id: "mid-morning", label: "9:00 AM - 12:00 PM", price: 1000 },
    { id: "afternoon", label: "12:00 PM - 3:00 PM", price: 1000 },
    { id: "evening", label: "3:00 PM - 6:00 PM", price: 1200 },
    { id: "night", label: "6:00 PM - 9:00 PM", price: 1500 },
    { id: "late-night", label: "9:00 PM - 12:00 AM", price: 1200 },
]
