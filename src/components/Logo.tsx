import Image from 'next/image';

export default function Logo() {
  return (
    <div className="relative w-24 h-10">
      <Image 
        src="/logos/logo(non-bg).png" 
        alt="ONA Logo" 
        fill
        className="object-contain object-left"
        priority
      />
    </div>
  );
}
