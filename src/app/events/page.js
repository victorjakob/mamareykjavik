import EventsList from "../components/events/EventsList";

export default function Events() {
  return (
    <div className="pt-40 mt-14  sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-center ">Upcoming Events</h1>
      <EventsList />
    </div>
  );
}
