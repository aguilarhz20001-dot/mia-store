import Image from "next/image";
import Link from "next/link";

export default function Logo({ size = 56 }: { size?: number }) {
  return (
    <Link href="/" className="flex items-center shrink-0" aria-label="Mia Store — Inicio">
      <Image
        src="/logo.png"
        alt="Mia Store"
        width={size}
        height={size}
        style={{ width: size, height: size }}
        priority
      />
    </Link>
  );
}
