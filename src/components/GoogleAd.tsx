'use client';

import { useEffect, useRef } from 'react';

export default function GoogleAd() {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const adsbygoogle = (window as any).adsbygoogle || [];
        // Only push if the ad hasn't been loaded yet
        if (adRef.current && adRef.current.children.length === 0) {
          adsbygoogle.push({});
        }
      } catch (e) {
        console.error('AdSense error', e);
      }
    }
  }, []);

  return (
    <div className="w-full bg-zinc-100 dark:bg-zinc-900/50 rounded-2xl overflow-hidden flex items-center justify-center min-h-[300px] my-6">
      <div className="w-full text-center overflow-hidden flex justify-center">
        <ins
          className="adsbygoogle"
          style={{ display: 'block', margin: 'auto', backgroundColor: 'transparent', height: '300px', width: '100%' }}
          data-ad-client="ca-pub-3600961769317289"
          data-ad-slot="9093952817"
          data-ad-format="auto"
          data-full-width-responsive="true"
          ref={adRef}
        />
      </div>
    </div>
  );
}
