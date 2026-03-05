"use client"

import { useState } from "react"
import { MapPin, Clock, ChevronRight, ChevronDown, Grid3X3, X, Check } from "lucide-react"
import { shakiraEvent } from "@/lib/data"

export function EventDetail() {
  const event = shakiraEvent
  const [readMore, setReadMore] = useState(false)
  const [showGallery, setShowGallery] = useState(false)
  const [showBooking, setShowBooking] = useState(false)
  const [ticketCount, setTicketCount] = useState(1)
  const [bookingConfirmed, setBookingConfirmed] = useState(false)

  const shortDesc = event.description.split("\n\n").slice(0, 2).join("\n\n")

  return (
    <>
      <div className="mx-auto max-w-5xl px-4 py-6">
        {/* Title */}
        <h1 className="text-2xl font-bold text-foreground md:text-3xl text-balance">
          {event.title}
        </h1>
        <p className="mt-1 text-sm">
          <span className="text-accent">{event.date}, {event.time}</span>
          <span className="text-muted-foreground"> | {event.venue}</span>
        </p>

        {/* Photo Gallery */}
        <div className="mt-6 grid grid-cols-4 gap-2 overflow-hidden rounded-xl" style={{ gridTemplateRows: "auto auto" }}>
          <div className="col-span-2 row-span-2 relative aspect-[4/3] overflow-hidden rounded-l-xl bg-secondary">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={event.images[0]}
              alt="Event main"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-foreground/60 text-primary-foreground backdrop-blur-sm">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="aspect-square overflow-hidden bg-secondary">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={event.images[1]} alt="Event photo" className="h-full w-full object-cover" />
          </div>
          <div className="aspect-square overflow-hidden bg-secondary">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={event.images[2]} alt="Event photo" className="h-full w-full object-cover" />
          </div>
          <div className="aspect-square overflow-hidden bg-secondary">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={event.images[3]} alt="Event photo" className="h-full w-full object-cover" />
          </div>
          <div className="relative aspect-square overflow-hidden rounded-br-xl bg-secondary">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={event.images[4]} alt="Event photo" className="h-full w-full object-cover" />
            <button
              onClick={() => setShowGallery(true)}
              className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-lg bg-card px-2.5 py-1.5 text-xs font-medium text-foreground shadow-sm hover:bg-secondary transition-colors"
            >
              <Grid3X3 className="h-3.5 w-3.5" />
              Show all photos
            </button>
          </div>
        </div>

        {/* Content + Sidebar */}
        <div className="mt-8 flex flex-col gap-8 lg:flex-row">
          {/* Main Content */}
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground">About</h2>
            <div className="mt-3 text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
              {readMore ? event.description : shortDesc}
              {!readMore && "..."}
            </div>
            <button
              onClick={() => setReadMore(!readMore)}
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-foreground hover:text-accent transition-colors"
            >
              {readMore ? "Read less" : "Read more"}
              <ChevronDown
                className={`h-4 w-4 transition-transform ${readMore ? "rotate-180" : ""}`}
              />
            </button>

            {/* Highlights */}
            <div className="mt-8">
              <h2 className="text-xl font-bold text-foreground">Highlights</h2>
              <ul className="mt-3 space-y-2">
                {event.highlights.map((h) => (
                  <li key={h} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-accent flex-shrink-0" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80">
            <div className="rounded-2xl border border-border bg-card p-5 lg:sticky lg:top-20">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">{event.venue}</p>
                  <p className="text-xs text-muted-foreground">{event.distance}</p>
                </div>
                <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
              </div>

              <div className="mt-4 flex items-start gap-3">
                <Clock className="mt-0.5 h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">{event.gateTime}</p>
                  <p className="text-xs text-muted-foreground">View full schedule & timeline</p>
                </div>
                <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
              </div>

              <div className="mt-5">
                <p className="text-sm font-medium text-accent">General Sale is live now</p>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-foreground">
                    <span className="text-xl font-bold">
                      <span className="font-sans">&#8377;</span>{event.price.toLocaleString("en-IN")}
                    </span>
                    <span className="text-sm text-muted-foreground"> onwards</span>
                  </p>
                  <button
                    onClick={() => setShowBooking(true)}
                    className="rounded-xl bg-foreground px-6 py-2.5 text-sm font-bold text-background hover:bg-foreground/90 transition-colors"
                  >
                    Book Tickets
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Modal */}
      {showGallery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/80 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-3xl">
            <div className="mb-4 flex justify-end">
              <button
                onClick={() => setShowGallery(false)}
                className="rounded-full bg-card p-2 text-foreground hover:bg-secondary transition-colors"
                aria-label="Close gallery"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {event.images.map((img, i) => (
                <div key={i} className="aspect-square overflow-hidden rounded-xl bg-secondary">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={`Event photo ${i + 1}`} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl bg-card p-6 shadow-xl">
            {!bookingConfirmed ? (
              <>
                <h2 className="text-lg font-bold text-foreground">Book Tickets</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {event.title}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {event.date}, {event.time} | {event.venue}
                </p>

                <div className="mt-6">
                  <label className="text-sm font-medium text-foreground">
                    Number of Tickets
                  </label>
                  <div className="mt-2 flex items-center gap-3">
                    <button
                      onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-foreground hover:bg-secondary transition-colors"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-lg font-bold text-foreground">
                      {ticketCount}
                    </span>
                    <button
                      onClick={() => setTicketCount(Math.min(10, ticketCount + 1))}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-foreground hover:bg-secondary transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="mt-6 border-t border-border pt-4 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Amount</p>
                    <p className="text-xl font-bold text-foreground">
                      <span className="font-sans">&#8377;</span>
                      {(event.price * ticketCount).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => {
                      setShowBooking(false)
                      setTicketCount(1)
                    }}
                    className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setBookingConfirmed(true)}
                    className="flex-1 rounded-xl bg-foreground px-4 py-2.5 text-sm font-bold text-background hover:bg-foreground/90 transition-colors"
                  >
                    Confirm
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="mt-4 text-lg font-bold text-foreground">Booking Confirmed!</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {ticketCount} ticket{ticketCount > 1 ? "s" : ""} for {event.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {event.date}, {event.time}
                </p>
                <p className="mt-1 text-lg font-bold text-foreground">
                  <span className="font-sans">&#8377;</span>
                  {(event.price * ticketCount).toLocaleString("en-IN")}
                </p>
                <button
                  onClick={() => {
                    setShowBooking(false)
                    setBookingConfirmed(false)
                    setTicketCount(1)
                  }}
                  className="mt-6 w-full rounded-xl bg-foreground px-4 py-2.5 text-sm font-bold text-background hover:bg-foreground/90 transition-colors"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
