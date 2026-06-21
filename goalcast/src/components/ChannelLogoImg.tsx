'use client';

interface ChannelLogoImgProps {
  src: string;
  alt: string;
  fallbackLetter: string;
}

/**
 * Client component wrapper for channel logo images.
 * Needed because Server Components cannot use onError event handlers.
 */
export default function ChannelLogoImg({ src, alt, fallbackLetter }: ChannelLogoImgProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-contain p-1"
      onError={(e) => {
        const img = e.currentTarget as HTMLImageElement;
        img.style.display = 'none';
        const parent = img.parentElement;
        if (parent) {
          parent.innerHTML = `<span style="color:#52525b;font-size:18px;font-weight:700">${fallbackLetter}</span>`;
        }
      }}
    />
  );
}
