import HeroVideo from "./components/homepage/HeroVideo";
import OpenHoursMama from "./components/homepage/OpenHoursMama";
import About from "./components/homepage/About";
import HeroWL from "./components/homepage/HeroWL";
import Hero from "./components/homepage/Hero";

export default function Home() {
  return (
    <div className="min-h-screen min-w-screen">
      <main>
        <Hero />
        <About />
        <OpenHoursMama />
      </main>
    </div>
  );
}
