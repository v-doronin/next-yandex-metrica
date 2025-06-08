import { usePathname } from 'next/navigation';
import { Router } from 'next/router';
import { useEffect } from 'react';

import { NextRouter } from '../lib/types/router';
import { ym } from '../lib/ym';

export const useTrackRouteChange = ({
  tagID,
  router,
}: {
  tagID: number | null;
  router: NextRouter;
}) => {
  const pathname = usePathname();

  useEffect(() => {
    if (router === 'app') return;

    const handleRouteChange = (url: URL): void => {
      ym(tagID, 'hit', url.toString());
    };

    Router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      Router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [tagID, router]);

  useEffect(() => {
    if (router === 'pages') return;

    ym(tagID, 'hit', pathname);
  }, [tagID, router, pathname]);
};
