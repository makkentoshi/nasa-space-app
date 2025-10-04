// Minimal app store stub used by dashboard during development.
// This is a lightweight replacement for a full Zustand store.

type Location = { lat: number; lng: number } | null;

const state = {
  location: { location: { lat: 40.7128, lng: -74.006 } } as { location: Location },
  isInEmergency: false,
};

export function useAppStore<T>(selector: (s: any) => T): T {
  // Simple selector invocation for server/client use during dev.
  return selector(state) as T;
}
