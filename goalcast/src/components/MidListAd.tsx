'use client';

import { useEffect, useRef } from 'react';

interface MidListAdConfig {
  midListAdEnabled?: boolean;
  midListAdType?: 'custom' | 'adsense';
  midListAdHtml?: string;
  midListAdAfterEvery?: number;
}

interface MidListAdProps {
  adConfig: MidListAdConfig;
}

export default function MidListAd({ adConfig }: MidListAdProps) {
  const { midListAdEnabled, midListAdType, midListAdHtml } = adConfig;
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    if (midListAdEnabled && midListAdType === 'adsense' && typeof window !== 'undefined') {
      try {
        const adsbygoogle = (window as any).adsbygoogle || [];
        if (adRef.current && adRef.current.children.length === 0) {
          adsbygoogle.push({});
        }
      } catch (e) {
        console.error('MidListAd AdSense error', e);
      }
    }
  }, [midListAdEnabled, midListAdType]);

  if (!midListAdEnabled) return null;

  return (
    <li className="my-1" aria-hidden="true">
      <div className="w-full rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700/40 flex items-center justify-center min-h-[90px]">
        {midListAdType === 'custom' ? (
          <div
            className="w-full flex items-center justify-center p-2"
            dangerouslySetInnerHTML={{ __html: midListAdHtml || '' }}
          />
        ) : (
          <div className="w-full text-center flex justify-center">
            <ins
              className="adsbygoogle"
              style={{ display: 'block', width: '100%', height: 'auto', minHeight: '90px' }}
              data-ad-client="ca-pub-3600961769317289"
              data-ad-slot="9093952817"
              data-ad-format="auto"
              data-full-width-responsive="true"
              ref={adRef}
            />
          </div>
        )}
      </div>
    </li>
  );
}
