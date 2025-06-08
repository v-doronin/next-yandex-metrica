import { act, renderHook } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { Router } from 'next/router';

import { useTrackRouteChange } from '../useTrackRouteChange';

const YM_MOCK = jest.fn();
Object.defineProperty(window, 'ym', {
  value: YM_MOCK,
  writable: true,
});

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

describe('useTrackRouteChange', () => {
  it('handles route change for pages router', () => {
    renderHook(() => useTrackRouteChange({ tagID: 444, router: 'pages' }));

    Router.events.emit('routeChangeStart');

    expect(YM_MOCK).not.toHaveBeenCalled();

    Router.events.emit('routeChangeComplete', 'https://test.com/');

    expect(YM_MOCK).toHaveBeenCalledTimes(1);
    expect(YM_MOCK).toHaveBeenCalledWith(444, 'hit', 'https://test.com/');
  });

  it('handles route change for app router', () => {
    (usePathname as jest.Mock).mockReturnValue('/initial');
    const onSpy = jest.spyOn(Router.events, 'on');

    const { rerender } = renderHook(() =>
      useTrackRouteChange({ tagID: 444, router: 'app' }),
    );

    expect(YM_MOCK).toHaveBeenCalledTimes(1);
    expect(YM_MOCK).toHaveBeenLastCalledWith(444, 'hit', '/initial');

    expect(onSpy).not.toHaveBeenCalled();

    (usePathname as jest.Mock).mockReturnValue('/second');

    act(() => {
      rerender();
    });

    expect(YM_MOCK).toHaveBeenCalledTimes(2);
    expect(YM_MOCK).toHaveBeenLastCalledWith(444, 'hit', '/second');
  });
});
