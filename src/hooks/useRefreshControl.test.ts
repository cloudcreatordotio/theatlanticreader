import { act, renderHook } from '@testing-library/react-native';
import { useRefreshControl } from './useRefreshControl';

test('stops refreshing once the refetch finishes', () => {
  const refetch = jest.fn();
  const { result, rerender } = renderHook(
    ({ fetching }: { fetching: boolean }) =>
      useRefreshControl({ fetching, refetch }),
    { initialProps: { fetching: false } },
  );

  act(() => result.current.onRefresh());
  expect(refetch).toHaveBeenCalledWith({ requestPolicy: 'network-only' });
  expect(result.current.refreshing).toBe(true);

  rerender({ fetching: true });
  expect(result.current.refreshing).toBe(true);

  rerender({ fetching: false });
  expect(result.current.refreshing).toBe(false);
});
