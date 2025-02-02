import EventsList from "../components/events/EventsList";

export default function Events() {
  return (
    <div className="mt-14 sm:mt-32  lg:px-8">
      <h1 className="leading-relaxed text-3xl font-bold text-right md:text-center w-1/2 md:w-full ml-auto md:ml-0 pr-8 mx-4 sm:mx-0">
        Upcoming Events
      </h1>
      <EventsList />
    </div>
  );
}
