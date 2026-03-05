"use client"

import { useState } from "react"
import { MapPin, ChevronDown, Flag, Check, X } from "lucide-react"
import { championsVenue, timeSlots } from "@/lib/data"

export function VenueDetail() {
  const venue = championsVenue
  const [showMore, setShowMore] = useState(false)
  const [showBooking, setShowBooking] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>("today")
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [bookingConfirmed, setBookingConfirmed] = useState(false)

  const dates = [
    { id: "today", label: "Today", date: "4 Mar" },
    { id: "tomorrow", label: "Tomorrow", date: "5 Mar" },
    { id: "day-after", label: "Thu", date: "6 Mar" },
  ]

  const selectedSlotData = timeSlots.find((s) => s.id === selectedSlot)

  return (
    <>
      <div className="mx-auto max-w-5xl">
        {/* Hero Image */}
        <div className="bg-foreground">
          <div className="mx-auto max-w-3xl px-4 py-6">
            <div className="flex flex-col gap-6 lg:flex-row">
              <div className="flex-1 overflow-hidden rounded-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={venue.image}
                  alt={venue.name}
                  className="h-full w-full object-cover"
                  style={{ maxHeight: 360 }}
                />
              </div>

              {/* Sidebar Card */}
              <div className="w-full lg:w-72">
                <div className="rounded-2xl border border-border bg-card p-5">
                  <h2 className="text-lg font-bold text-foreground">{venue.name}</h2>
                  <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <Flag className="h-4 w-4" />
                    <span>{venue.category}</span>
                  </div>
                  <div className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>{venue.address}</span>
                  </div>
                  <button
                    onClick={() => setShowBooking(true)}
                    className="mt-5 w-full rounded-lg bg-foreground py-3 text-center text-sm font-bold uppercase tracking-wider text-background hover:bg-foreground/90 transition-colors"
                  >
                    Book Slots
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="px-4 py-8">
          <h2 className="text-xl font-bold text-foreground">About the Venue</h2>
          <div className="mt-3">
            <p className="text-sm font-semibold text-foreground">
              {"Experience the thrill of cricket at Champion's Cave, Gurgaon!"}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {showMore ? venue.fullDescription : venue.description}
            </p>
            <button
              onClick={() => setShowMore(!showMore)}
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-foreground hover:text-accent transition-colors"
            >
              {showMore ? "Show less" : "Show more"}
              <ChevronDown
                className={`h-4 w-4 transition-transform ${showMore ? "rotate-180" : ""}`}
              />
            </button>
          </div>

          <div className="mt-6 border-t border-border pt-6">
            <h3 className="text-lg font-bold text-foreground">Venue Guide</h3>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border p-4">
                <p className="text-sm font-semibold text-foreground">Location</p>
                <p className="mt-1 text-sm text-muted-foreground">{venue.address}</p>
              </div>
              <div className="rounded-xl border border-border p-4">
                <p className="text-sm font-semibold text-foreground">Timing</p>
                <p className="mt-1 text-sm text-muted-foreground">6:00 AM - 12:00 AM</p>
              </div>
              <div className="rounded-xl border border-border p-4">
                <p className="text-sm font-semibold text-foreground">Facilities</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Bowling machine, LED lights, Spectator area, Parking
                </p>
              </div>
              <div className="rounded-xl border border-border p-4">
                <p className="text-sm font-semibold text-foreground">Best For</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Corporate events, Tournaments, Casual games, Practice
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slot Booking Modal */}
      {showBooking && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 backdrop-blur-sm sm:items-center">
          <div className="mx-0 w-full max-w-lg rounded-t-2xl bg-card p-6 shadow-xl sm:mx-4 sm:rounded-2xl">
            {!bookingConfirmed ? (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-foreground">Book a Slot</h2>
                  <button
                    onClick={() => {
                      setShowBooking(false)
                      setSelectedSlot(null)
                    }}
                    className="rounded-full p-1 text-muted-foreground hover:bg-secondary transition-colors"
                    aria-label="Close booking"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{venue.name}</p>

                {/* Date Selection */}
                <div className="mt-5">
                  <p className="text-sm font-medium text-foreground">Select Date</p>
                  <div className="mt-2 flex gap-2">
                    {dates.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => setSelectedDate(d.id)}
                        className={`flex-1 rounded-lg border px-3 py-2 text-center text-sm transition-colors ${
                          selectedDate === d.id
                            ? "border-accent bg-accent/10 text-accent font-semibold"
                            : "border-border text-foreground hover:bg-secondary"
                        }`}
                      >
                        <span className="block font-medium">{d.label}</span>
                        <span className="block text-xs text-muted-foreground">{d.date}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Slots */}
                <div className="mt-5">
                  <p className="text-sm font-medium text-foreground">Select Time Slot</p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => setSelectedSlot(slot.id)}
                        className={`rounded-lg border px-3 py-3 text-left transition-colors ${
                          selectedSlot === slot.id
                            ? "border-accent bg-accent/10"
                            : "border-border hover:bg-secondary"
                        }`}
                      >
                        <span className={`block text-sm font-medium ${
                          selectedSlot === slot.id ? "text-accent" : "text-foreground"
                        }`}>
                          {slot.label}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          <span className="font-sans">&#8377;</span>{slot.price.toLocaleString("en-IN")}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Confirm */}
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => {
                      setShowBooking(false)
                      setSelectedSlot(null)
                    }}
                    className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={!selectedSlot}
                    onClick={() => setBookingConfirmed(true)}
                    className="flex-1 rounded-xl bg-foreground px-4 py-2.5 text-sm font-bold text-background hover:bg-foreground/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {selectedSlotData
                      ? `Book for \u20B9${selectedSlotData.price.toLocaleString("en-IN")}`
                      : "Select a slot"}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="mt-4 text-lg font-bold text-foreground">Slot Booked!</h2>
                <p className="mt-2 text-sm text-muted-foreground">{venue.name}</p>
                <p className="text-sm text-muted-foreground">
                  {dates.find((d) => d.id === selectedDate)?.date} &middot;{" "}
                  {selectedSlotData?.label}
                </p>
                <p className="mt-1 text-lg font-bold text-foreground">
                  <span className="font-sans">&#8377;</span>
                  {selectedSlotData?.price.toLocaleString("en-IN")}
                </p>
                <button
                  onClick={() => {
                    setShowBooking(false)
                    setBookingConfirmed(false)
                    setSelectedSlot(null)
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
