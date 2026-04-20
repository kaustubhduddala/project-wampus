import { useEffect, useMemo, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { CalendarDays, Clock3, MapPin, Users } from 'lucide-react';
import { getEvents, type Event } from '@/api/publicApi';
import { Button } from '@/components/ui/button';

type CalendarValue = Date | null;

function toLocalDateKey(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatEventType(eventType: string | null): string {
  if (!eventType) return 'General';
  if (eventType === 'general_meeting') return 'General Meeting';
  if (eventType === 'food_drive') return 'Food Drive';
  return 'Other';
}

function eventTypeClass(eventType: string | null): string {
  if (eventType === 'food_drive') return 'bg-[#F97316] text-white';
  if (eventType === 'general_meeting') return 'bg-[#22C55E] text-white';
  return 'bg-black text-white';
}

export default function Activities() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<CalendarValue>(null);

  useEffect(() => {
    let mounted = true;

    const loadEvents = async () => {
      setLoadingEvents(true);
      setEventsError(null);

      try {
        const payload = await getEvents(true);
        if (mounted) {
          setEvents(payload);
        }
      } catch (error) {
        if (mounted) {
          setEvents([]);
          setEventsError(error instanceof Error ? error.message : 'Failed to load upcoming events');
        }
      } finally {
        if (mounted) {
          setLoadingEvents(false);
        }
      }
    };

    loadEvents();

    return () => {
      mounted = false;
    };
  }, []);

  const eventDateKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const event of events) {
      keys.add(toLocalDateKey(event.event_date));
    }
    return keys;
  }, [events]);

  const selectedDateKey = selectedDate ? toLocalDateKey(selectedDate) : null;

  const filteredEvents = useMemo(() => {
    if (!selectedDateKey) return events;
    return events.filter((event) => toLocalDateKey(event.event_date) === selectedDateKey);
  }, [events, selectedDateKey]);

  return (
    <div>
      <section className="bg-[#22C55E] py-20 neo-brutal-border border-b-4">
        <div className="container mx-auto px-4 text-center">
          <div className="w-20 h-20 bg-black neo-brutal-border mx-auto mb-6 flex items-center justify-center">
            <Users className="w-10 h-10 text-[#22C55E]" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-6 text-white">GET INVOLVED</h1>
          <p className="text-xl font-bold text-black max-w-3xl mx-auto">
            See upcoming meetings, food drives, and volunteer-focused community events.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h2 className="text-3xl font-black">UPCOMING ACTIVITIES</h2>
          {selectedDateKey && (
            <Button
              type="button"
              onClick={() => setSelectedDate(null)}
              className="neo-button bg-black! text-white font-black"
            >
              CLEAR DATE FILTER
            </Button>
          )}
        </div>

        {loadingEvents && (
          <div className="bg-white neo-brutal-border-thin p-4 mb-6">
            <p className="font-bold">Loading events...</p>
          </div>
        )}

        {eventsError && (
          <div className="bg-yellow-100 neo-brutal-border-thin p-4 mb-6">
            <p className="font-bold text-yellow-800">Could not load events: {eventsError}</p>
          </div>
        )}

        {!loadingEvents && !eventsError && filteredEvents.length === 0 && (
          <div className="bg-[#F5F5F5] neo-brutal-border neo-brutal-shadow p-10 text-center">
            <p className="text-xl font-black mb-2">NO EVENTS FOUND</p>
            <p className="font-bold text-gray-600">
              {selectedDateKey
                ? 'No activities are scheduled on the selected date.'
                : 'No upcoming activities have been published yet.'}
            </p>
          </div>
        )}

        {filteredEvents.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {filteredEvents.map((event) => {
              const eventDate = new Date(event.event_date);
              return (
                <article key={event.id} className="bg-white neo-brutal-border neo-brutal-shadow p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <h3 className="text-2xl font-black leading-tight">{event.title}</h3>
                    <span
                      className={`neo-brutal-border-thin text-xs px-3 py-1 font-black uppercase tracking-wide ${eventTypeClass(event.event_type)}`}
                    >
                      {formatEventType(event.event_type)}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4 text-sm font-bold">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-[#22C55E]" />
                      <span>{eventDate.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock3 className="w-4 h-4 text-[#22C55E]" />
                      <span>{eventDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#22C55E]" />
                      <span>{event.location || 'Location to be announced'}</span>
                    </div>
                  </div>

                  <p className="text-sm font-bold text-gray-700">
                    {event.description || 'No additional details provided.'}
                  </p>
                </article>
              );
            })}
          </div>
        )}

        <div className="bg-white neo-brutal-border neo-brutal-shadow p-6 md:p-8">
          <h3 className="text-2xl font-black mb-2">EVENT CALENDAR</h3>
          <p className="text-sm font-bold text-gray-700 mb-6">
            Click a highlighted date to filter activities. All times are shown in your local timezone.
          </p>

          <div className="max-w-xl mx-auto">
            <Calendar
              onChange={(next) => setSelectedDate(Array.isArray(next) ? next[0] : next)}
              value={selectedDate}
              tileClassName={({ date, view }) => {
                if (view !== 'month') return undefined;
                const key = toLocalDateKey(date);
                return eventDateKeys.has(key)
                  ? 'bg-[#DCFCE7] border-2 border-black font-black'
                  : undefined;
              }}
              tileContent={({ date, view }) => {
                if (view !== 'month') return null;
                const key = toLocalDateKey(date);
                if (!eventDateKeys.has(key)) return null;

                return (
                  <div className="mt-1 flex justify-center">
                    <span className="inline-block w-2 h-2 bg-[#22C55E] rounded-full" />
                  </div>
                );
              }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
