import { usePathname } from 'next/navigation';
import { Router } from 'next/router';
import { useEffect } from 'react';

import { ym } from '../lib/ym';

export const useTrackRouteChange = ({ tagID, appRouter }: { tagID: number | null, appRouter?: boolean }) => {
  const pathname = usePathname();

  useEffect(() => {
    if (appRouter) return;

    const handleRouteChange = (url: URL): void => {
      ym(tagID, 'hit', url.toString());
    };

    Router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      Router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [tagID, appRouter]);

  useEffect(() => {
    if (!appRouter) return;

    ym(tagID, 'hit', pathname);
  }, [tagID, appRouter, pathname]);
};
