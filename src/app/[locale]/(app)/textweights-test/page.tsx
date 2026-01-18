export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="mb-4 text-4xl font-bold">Comfortaa Text Weights</h1>
      <p className="font-light">
        This is a simple landing page with Next.js and Tailwind CSS
      </p>
      <p className="font-normal">
        This is a simple landing page with Next.js and Tailwind CSS
      </p>
      <p className="font-medium">
        This is a simple landing page with Next.js and Tailwind CSS
      </p>
      <p className="font-semibold">
        This is a simple landing page with Next.js and Tailwind CSS
      </p>
      <p className="font-bold">
        This is a simple landing page with Next.js and Tailwind CSS
      </p>

      <p className="mt-12" />

      {/* also add all possible font weights for the mono-font */}
      <p className="font-mono font-thin">
        This is an example of a mono-font paragraph with thin weight.
      </p>
      <p className="font-mono font-extralight">
        This is an example of a mono-font paragraph with extra light weight.
      </p>
      <p className="font-mono font-light">
        This is an example of a mono-font paragraph with light weight.
      </p>
      <p className="font-mono font-normal">
        This is an example of a mono-font paragraph with normal weight.
      </p>
      <p className="font-mono font-medium">
        This is an example of a mono-font paragraph with medium weight.
      </p>
      <p className="font-mono font-semibold">
        This is an example of a mono-font paragraph with semi bold weight.
      </p>
      <p className="font-mono font-bold">
        This is an example of a mono-font paragraph with bold weight.
      </p>
      <p className="font-mono font-extrabold">
        This is an example of a mono-font paragraph with extra bold weight.
      </p>
      <p className="font-mono font-black">
        This is an example of a mono-font paragraph with black weight.
      </p>
    </main>
  );
}
