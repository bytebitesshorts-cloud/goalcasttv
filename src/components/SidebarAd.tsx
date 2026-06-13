'use client';

import { useEffect, useRef } from 'react';

interface SidebarAdProps {
  adConfig: {
    enabled: boolean;
    type: 'custom' | 'adsense';
    customHtml: string;
    adsenseClientId: string;
    adsenseSlotId: string;
  };
}

export default function SidebarAd({ adConfig }: SidebarAdProps) {
  const { enabled, type, customHtml, adsenseClientId, adsenseSlotId } = adConfig;
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    if (enabled && type === 'adsense' && typeof window !== 'undefined') {
      try {
        const adsbygoogle = (window as any).adsbygoogle || [];
        // Only push if the ad hasn't been loaded yet to prevent "Ad is already pushed" error
        if (adRef.current && adRef.current.children.length === 0) {
          adsbygoogle.push({});
        }
      } catch (e) {
        console.error('AdSense error', e);
      }
    }
  }, [enabled, type]);

  if (!enabled) return null;

  return (
    <div className="w-full bg-zinc-100 dark:bg-zinc-900/50 rounded-2xl overflow-hidden flex items-center justify-center min-h-[100px] mb-6">
      {type === 'custom' ? (
        <div
          className="w-full h-full flex items-center justify-center"
          dangerouslySetInnerHTML={{ __html: customHtml || '' }}
        />
      ) : (
        <div className="w-full text-center overflow-hidden flex justify-center">
          <ins
            className="adsbygoogle"
            style={{ display: 'block', width: '100%', height: 'auto' }}
            data-ad-client={adsenseClientId}
            data-ad-slot={adsenseSlotId}
            data-ad-format="auto"
            data-full-width-responsive="true"
            ref={adRef}
          ></ins>
        </div>
      )}
    </div>
  );
}
