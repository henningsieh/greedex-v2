import Image from "next/image";

function RightSideImage() {
  return (
    <div className="relative hidden bg-muted lg:block">
      <Image
        src="/greendex_logo.png"
        alt="Greendex Logo"
        fill
        className="object-contain p-12 dark:brightness-[0.2] dark:grayscale"
      />
    </div>
  );
}

export default RightSideImage;
