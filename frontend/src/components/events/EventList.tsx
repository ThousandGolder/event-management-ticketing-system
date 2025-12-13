import { EventCard } from "./EventCard";

const sampleEvents = [
  {
    id: "1",
    title: "Summer Music Festival",
    description: "Annual summer music celebration",
    date: "June 15, 2024",
    location: "Central Park",
    attendees: 450,
    capacity: 500,
    category: "Music",
  },
  {
    id: "2",
    title: "Tech Conference 2024",
    description: "Latest in technology and innovation",
    date: "July 20, 2024",
    location: "Convention Center",
    attendees: 300,
    capacity: 400,
    category: "Technology",
  },
  {
    id: "3",
    title: "Food & Wine Expo",
    description: "Culinary delights from around the world",
    date: "August 5, 2024",
    location: "Expo Center",
    attendees: 200,
    capacity: 300,
    category: "Food",
  },
];

export function EventList() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {sampleEvents.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
