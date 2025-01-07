import { Button } from "../Button";

export default function About() {
  return (
    <section className="relative mb-36 mt-36 isolate">
      {/* Background Gradient */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-[-10rem] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[-20rem]"
      >
        <div
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
          className="relative left-1/2 -z-10 aspect-[1155/678] w-[36.125rem] max-w-none -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#455318] to-[#96bf6b] opacity-30 sm:left-[calc(50%-40rem)] sm:w-[72.1875rem]"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col items-center justify-center">
        <h2 className="text-black text-5xl font-bold mb-10 text-center">
          About Us
        </h2>
        <p className="text-black text-lg text-center mx-auto max-w-3xl mb-12">
          We are a company dedicated to providing top-notch services to our
          clients. With years of experience and a team of experts, we strive to
          deliver excellence in everything we do. Our commitment to Earth
          Medicine principles guides our approach to holistic wellness and
          sustainable practices.
        </p>
        <Button href="/about">Learn More</Button>
      </div>
    </section>
  );
}
