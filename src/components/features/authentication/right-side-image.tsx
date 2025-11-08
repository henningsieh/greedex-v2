import Image from "next/image";

function RightSideImage() {
  return (
    <div className="relative hidden bg-muted lg:block">
      <Image
        src="/greendex_logo.png"
        alt="Greendex Logo"
        fill
        className="object-contain p-12"
      />
    </div>
  );
}

export default RightSideImage;
