import EventsList from "../components/EventsList";

const events = [
  {
    id: 1,
    name: "Full Moon Cacao Ceremony",
    price: 30,
    startTime: new Date("2024-03-25T19:00:00"),
    duration: "2 hours",
    description:
      "Connect with your inner self through the sacred cacao ritual under the full moon.",
    longDescription:
      "Experience the transformative power of cacao in our Full Moon Cacao Ceremony. This ancient ritual, performed under the enchanting light of the full moon, offers a unique opportunity to connect deeply with yourself and others. Our carefully sourced, ceremonial-grade cacao opens the heart, enhances focus, and facilitates profound introspection. Led by experienced facilitators, you'll be guided through meditation, intention setting, and sharing circles. This ceremony is perfect for those seeking personal growth, emotional healing, or simply a night of community and inner exploration. Join us for an evening of magic, connection, and self-discovery.",
    imageUrl: "/placeholder.svg?height=1005&width=1920",
    location: "Sacred Grove Retreat Center",
    availableTickets: 20,
  },
  {
    id: 2,
    name: "Ecstatic Dance Journey",
    price: 25,
    startTime: new Date("2024-03-25T20:00:00"),
    duration: "1.5 hours",
    description: "Free your body and mind in this liberating dance experience.",
    longDescription:
      "Embark on a transformative journey through movement with our Ecstatic Dance Journey. This unique event invites you to let go of inhibitions and connect with your body's natural rhythm. Guided by expert facilitators and accompanied by soul-stirring music, you'll experience the joy of free-form dance in a safe, judgment-free space. Whether you're a seasoned dancer or have two left feet, this journey is for everyone seeking to release stress, boost energy, and tap into their creative flow. Come as you are and dance your way to bliss!",
    imageUrl: "/placeholder.svg?height=1005&width=1920",
    location: "Harmony Dance Studio",
    availableTickets: 30,
  },
  {
    id: 3,
    name: "Shamanic Breathwork Workshop",
    price: 40,
    startTime: new Date("2024-03-27T18:30:00"),
    duration: "2.5 hours",
    description:
      "Dive deep into your subconscious through guided breathwork techniques.",
    longDescription:
      "Unlock the healing power of your breath in our Shamanic Breathwork Workshop. This profound practice combines ancient wisdom with modern techniques to facilitate deep emotional release and spiritual awakening. Led by experienced shamanic practitioners, you'll learn powerful breathwork patterns that can induce altered states of consciousness, allowing for personal insights, emotional healing, and spiritual growth. This workshop is ideal for those seeking to overcome past traumas, break through limiting beliefs, or simply explore the depths of their inner world. Prepare for a journey of self-discovery and transformation.",
    imageUrl: "/placeholder.svg?height=1005&width=1920",
    location: "Mystic Mountain Retreat",
    availableTickets: 15,
  },
  {
    id: 4,
    name: "New Moon Intention Setting Circle",
    price: 20,
    startTime: new Date("2024-03-30T19:00:00"),
    duration: "1.5 hours",
    description:
      "Set powerful intentions for the lunar cycle ahead in this supportive group setting.",
    longDescription:
      "Harness the potent energy of the New Moon in our Intention Setting Circle. This intimate gathering provides a sacred space for reflection, release, and renewal. Guided by intuitive facilitators, you'll learn how to align your personal goals with the lunar cycle, amplifying your manifestation power. Through meditation, journaling, and group sharing, you'll clarify your intentions and plant the seeds for future growth. This circle is perfect for anyone looking to create positive change in their life, deepen their spiritual practice, or simply connect with like-minded individuals. Join us as we tune into the subtle rhythms of nature and set our course for the month ahead.",
    imageUrl: "/placeholder.svg?height=1005&width=1920",
    location: "Serenity Gardens",
    availableTickets: 25,
  },
];

export default function Events() {
  return (
    <div className="min-h-screen mt-16 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Upcoming Spiritual Events
      </h1>
      <EventsList events={events} />
    </div>
  );
}

export { events };
