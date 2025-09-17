import { render } from '@testing-library/react';
import React from 'react';
import { HTMLAttributes } from 'react';

import { useTrackRouteChange } from '../../hooks/useTrackRouteChange';
import { YandexMetricaProvider } from '../YandexMetricaProvider';

jest.mock('../../hooks/useTrackRouteChange');

jest.mock(
  'next/script',
  () =>
    function MockNextScript(props: HTMLAttributes<HTMLDivElement>) {
      return <div {...props} />;
    },
);

const METRICA_SCRIPT =
  '(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)}; m[i].l=1*new Date(); for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }} k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)}) (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");';

const METRICA_SCRIPT_ALTERNATIVE_CDN =
  '(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)}; m[i].l=1*new Date(); for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }} k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)}) (window, document, "script", "https://cdn.jsdelivr.net/npm/yandex-metrica-watch/tag.js", "ym");';

describe('YandexMetricaProvider', () => {
  it('renders', () => {
    render(
      <YandexMetricaProvider tagID={444}>
        <div />
      </YandexMetricaProvider>,
    );

    expect(useTrackRouteChange).toHaveBeenCalledWith({ tagID: 444 });

    expect(document.getElementById('yandex-metrica')).toHaveTextContent(
      `${METRICA_SCRIPT} ym(444, "init", {});`,
    );
    expect(document.getElementById('yandex-metrica-pixel')).toBeInTheDocument();
  });

  it('renders with custom init parameters', () => {
    render(
      <YandexMetricaProvider
        tagID={444}
        initParameters={{ accurateTrackBounce: false, clickmap: false }}
      >
        <div />
      </YandexMetricaProvider>,
    );

    expect(document.getElementById('yandex-metrica')).toHaveTextContent(
      `${METRICA_SCRIPT} ym(444, "init", {"accurateTrackBounce":false,"clickmap":false});`,
    );
  });

  it('renders with an alternative CDN url', () => {
    render(
      <YandexMetricaProvider tagID={444} shouldUseAlternativeCDN>
        <div />
      </YandexMetricaProvider>,
    );

    expect(useTrackRouteChange).toHaveBeenCalledWith({ tagID: 444 });

    expect(document.getElementById('yandex-metrica')).toHaveTextContent(
      `${METRICA_SCRIPT_ALTERNATIVE_CDN} ym(444, "init", {});`,
    );
    expect(document.getElementById('yandex-metrica-pixel')).toBeInTheDocument();
  });

  it('renders children when tagID is not defined', () => {
    const spyOnWarn = jest.spyOn(console, 'warn').mockImplementation();
    render(
      <YandexMetricaProvider>
        <div id="content" />
      </YandexMetricaProvider>,
    );

    expect(document.getElementById('content')).toBeInTheDocument();
    expect(document.getElementById('yandex-metrica')).not.toBeInTheDocument();
    expect(spyOnWarn).toHaveBeenCalledWith(
      '[next-yandex-metrica] Yandex.Metrica tag ID is not defined',
    );
  });

  it('gets tagID from NEXT_PUBLIC_YANDEX_METRICA_ID', () => {
    process.env.NEXT_PUBLIC_YANDEX_METRICA_ID = '444';
    render(
      <YandexMetricaProvider>
        <div />
      </YandexMetricaProvider>,
    );

    expect(document.getElementById('yandex-metrica')).toHaveTextContent(
      `${METRICA_SCRIPT} ym(444, "init", {});`,
    );
  });

  it('renders tracking pixel', () => {
    render(
      <YandexMetricaProvider tagID={444}>
        <div />
      </YandexMetricaProvider>,
    );

    const pixelElement = document.getElementById('yandex-metrica-pixel');
    expect(pixelElement).toBeInTheDocument();

    expect(pixelElement?.innerHTML).toBe(
      '<div><img src="https://mc.yandex.ru/watch/444" style="position:absolute; left:-9999px;" alt="" /></div>',
    );
  });
});
