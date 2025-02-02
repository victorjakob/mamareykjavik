import { Button } from "../Button";

export default function About() {
  return (
    <section className="relative my-16 sm:my-24 md:my-36 px-4 sm:px-6 isolate">
      {/* Content */}
      <div className="flex flex-col items-center justify-center">
        <h2 className="text-black text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8 md:mb-10 text-center">
          About Us
        </h2>
        <p className="text-black text-base sm:text-lg text-center mx-auto max-w-3xl mb-8 sm:mb-10 md:mb-12">
          Nestled in the heart of Reykjavik, Mama is more than just a
          restaurant—it is a sanctuary of nourishment, connection, and holistic
          living. Rooted in the values of wholeness, vitality, health, and
          community, Mama is a place where food becomes medicine, and where
          people from all walks of life gather to celebrate, share, and grow.
        </p>
        <Button href="/about">Learn More</Button>
      </div>
    </section>
  );
}
