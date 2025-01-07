export default function OpenHoursMama() {
  return (
    <div className="relative h-screen bg-gray-100 flex items-center justify-center overflow-hidden">
      {/* Background Images */}
      <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 gap-0">
        <img
          src="/mamaimg/mamacoffee.jpeg"
          alt="Image 1"
          className="w-full h-full object-cover"
        />
        <img
          src="/mamaimg/mamavibe2.JPG"
          alt="Image 2"
          className="w-full h-full object-cover"
        />
        <img
          src="/mamaimg/mamavibe1.jpeg"
          alt="Image 3"
          className="w-full h-full object-cover"
        />
        <img
          src="/mamaimg/mamadahl.jpeg"
          alt="Image 4"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Centered Text */}
      <div className="relative bg-white bg-opacity-70 p-8 rounded-md shadow-2xl text-center w-11/12 max-w-md md:max-w-lg lg:max-w-xl">
        <h1 className="text-4xl font-bold mb-4 md:text-5xl">Opening Hours</h1>
        <h2 className="text-lg md:text-xl lg:text-2xl">
          Every day <br /> From 11:00 - 21:00
        </h2>
      </div>
    </div>
  );
}
