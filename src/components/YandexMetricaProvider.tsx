'use client';

import Script, { ScriptProps } from 'next/script';
import React, { createContext, FC, ReactNode, useMemo } from 'react';

import { useTrackRouteChange } from '../hooks/useTrackRouteChange';
import { InitParameters } from '../lib/types/parameters';
import { NextRouter } from '../lib/types/router';

export const MetricaTagIDContext = createContext<number | null>(null);

interface Props {
  children: ReactNode;
  tagID?: number;
  strategy?: ScriptProps['strategy'];
  initParameters?: InitParameters;
  shouldUseAlternativeCDN?: boolean;
  router: NextRouter;
}

export const YandexMetricaProvider: FC<Props> = ({
  children,
  tagID,
  strategy = 'afterInteractive',
  initParameters,
  shouldUseAlternativeCDN = false,
  router,
}) => {
  const YANDEX_METRICA_ID = process.env.NEXT_PUBLIC_YANDEX_METRICA_ID;
  const id = useMemo(() => {
    return tagID || (YANDEX_METRICA_ID ? Number(YANDEX_METRICA_ID) : null);
  }, [YANDEX_METRICA_ID, tagID]);

  useTrackRouteChange({ tagID: id, router });

  if (!id) {
    console.warn('[next-yandex-metrica] Yandex.Metrica tag ID is not defined');

    return <>{children}</>;
  }

  const scriptSrc = shouldUseAlternativeCDN
    ? 'https://cdn.jsdelivr.net/npm/yandex-metrica-watch/tag.js'
    : 'https://mc.yandex.ru/metrika/tag.js';

  return (
    <>
      <Script id="yandex-metrica" strategy={strategy}>
        {`
          (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
          m[i].l=1*new Date();
          for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
          k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
          (window, document, "script", "${scriptSrc}", "ym");
          ym(${id}, "init", ${JSON.stringify(initParameters || {})});
        `}
      </Script>
      <noscript
        id="yandex-metrica-pixel"
        dangerouslySetInnerHTML={{
          __html: `<div><img src="https://mc.yandex.ru/watch/${id}" style="position:absolute; left:-9999px;" alt="" /></div>`,
        }}
      />
      <MetricaTagIDContext.Provider value={id}>{children}</MetricaTagIDContext.Provider>
    </>
  );
};
