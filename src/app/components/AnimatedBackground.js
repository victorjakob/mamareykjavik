"use client";

export default function AnimatedBackground() {
  const NUM_SHAPES = 5;

  const positions = [
    { top: "10%", left: "5%" },
    { top: "60%", left: "70%" },
    { top: "30%", left: "40%" },
    { top: "80%", left: "20%" },
    { top: "20%", left: "80%" },
  ];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {[...Array(NUM_SHAPES)].map((_, i) => (
        <div
          key={i}
          aria-hidden="true"
          className="absolute -z-10 aspect-[1155/678] w-[36.125rem] max-w-full bg-gradient-to-tr from-[#455318] via-[#455318aa] to-[#96bf6b88] opacity-10 blur-3xl"
          style={positions[i]}
        />
      ))}
    </div>
  );
}
