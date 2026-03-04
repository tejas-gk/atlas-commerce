export type ProductUnit = {
    label: string
    price: number
    mrp: number
    discount: number
    disabled?: boolean
}

export type Product = {
    id: string
    title: string
    images: string[]
    units: ProductUnit[]
}

export type Event = {
    id: string
    title: string
    date: string
    price: number
}

export type Movie = {
    id: string
    title: string
    duration: string
    rating: string
}