'use client'

import { useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  LogIn,
  LogOut,
} from 'lucide-react'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isWithinInterval,
  parseISO,
} from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Booking, Property } from '@/types'

interface CalendarViewProps {
  bookings: Booking[]
  properties: Property[]
}

const platformColors: Record<string, string> = {
  airbnb: 'bg-red-400',
  vrbo: 'bg-blue-400',
  booking: 'bg-indigo-400',
  direct: 'bg-green-400',
}

export default function CalendarView({ bookings, properties }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Pad beginning of month
  const startPad = monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1
  const paddingDays = Array.from({ length: startPad }, (_, i) => i)

  function getBookingsForDay(day: Date): Booking[] {
    return bookings.filter((booking) => {
      const checkIn = parseISO(booking.check_in)
      const checkOut = parseISO(booking.check_out)
      return isWithinInterval(day, { start: checkIn, end: checkOut })
    })
  }

  function getPropertyName(propertyId: string): string {
    return properties.find((p) => p.id === propertyId)?.name ?? 'Chalet'
  }

  const weekdays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
      {/* Calendar header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <h2 className="text-lg font-semibold capitalize text-gray-900">
          {format(currentDate, 'MMMM yyyy', { locale: fr })}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
          >
            Aujourd&apos;hui
          </button>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="p-4">
        {/* Weekday headers */}
        <div className="mb-2 grid grid-cols-7 gap-1">
          {weekdays.map((day) => (
            <div
              key={day}
              className="py-2 text-center text-xs font-medium text-gray-500"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Padding days */}
          {paddingDays.map((i) => (
            <div key={`pad-${i}`} className="h-24 rounded-lg bg-gray-50/50" />
          ))}

          {/* Actual days */}
          {days.map((day) => {
            const dayBookings = getBookingsForDay(day)
            const isToday = isSameDay(day, new Date())
            const isCurrentMonth = isSameMonth(day, currentDate)

            return (
              <div
                key={day.toISOString()}
                className={`h-24 rounded-lg border p-1.5 ${
                  isToday
                    ? 'border-mountain-400 bg-mountain-50'
                    : 'border-gray-100 bg-white hover:border-gray-200'
                } ${!isCurrentMonth ? 'opacity-50' : ''}`}
              >
                <div
                  className={`mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                    isToday
                      ? 'bg-mountain-600 text-white'
                      : 'text-gray-700'
                  }`}
                >
                  {format(day, 'd')}
                </div>

                {/* Booking dots */}
                <div className="space-y-0.5">
                  {dayBookings.slice(0, 3).map((booking) => {
                    const isCheckIn = isSameDay(parseISO(booking.check_in), day)
                    const isCheckOut = isSameDay(parseISO(booking.check_out), day)
                    const color = platformColors[booking.platform ?? 'direct'] ?? 'bg-gray-400'

                    return (
                      <button
                        key={booking.id}
                        onClick={() => setSelectedBooking(booking)}
                        className={`flex w-full items-center gap-0.5 rounded px-1 py-0.5 text-left text-white transition-opacity hover:opacity-80 ${color}`}
                      >
                        {isCheckIn && <LogIn className="h-2.5 w-2.5 shrink-0" />}
                        {isCheckOut && <LogOut className="h-2.5 w-2.5 shrink-0" />}
                        <span className="truncate text-xs">
                          {getPropertyName(booking.property_id)}
                        </span>
                      </button>
                    )
                  })}
                  {dayBookings.length > 3 && (
                    <p className="text-xs text-gray-400">
                      +{dayBookings.length - 3} autres
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Booking detail panel */}
      {selectedBooking && (
        <div className="border-t border-gray-100 bg-snow-50 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">
                {selectedBooking.guest_name ?? 'Invité inconnu'}
              </h3>
              <p className="text-sm text-gray-500">
                {getPropertyName(selectedBooking.property_id)}
              </p>
            </div>
            <button
              onClick={() => setSelectedBooking(null)}
              className="text-xs text-gray-500 underline"
            >
              Fermer
            </button>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-500">Arrivée</p>
              <p className="font-medium text-gray-900">
                {format(parseISO(selectedBooking.check_in), 'dd MMMM yyyy', { locale: fr })}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Départ</p>
              <p className="font-medium text-gray-900">
                {format(parseISO(selectedBooking.check_out), 'dd MMMM yyyy', { locale: fr })}
              </p>
            </div>
            {selectedBooking.guest_email && (
              <div>
                <p className="text-xs text-gray-500">Courriel</p>
                <p className="font-medium text-gray-900">{selectedBooking.guest_email}</p>
              </div>
            )}
            {selectedBooking.platform && (
              <div>
                <p className="text-xs text-gray-500">Plateforme</p>
                <p className="font-medium capitalize text-gray-900">
                  {selectedBooking.platform}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 border-t border-gray-100 px-6 py-3">
        {Object.entries(platformColors).map(([platform, color]) => (
          <div key={platform} className="flex items-center gap-1.5">
            <div className={`h-2.5 w-2.5 rounded-full ${color}`} />
            <span className="text-xs capitalize text-gray-600">{platform}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
