import { useEffect, useRef, useSyncExternalStore } from 'react';

const activeTokens = new Set<symbol>();
const subscribers = new Set<() => void>();

export const useGlobalShortcutLock = (isLocked: boolean) => {
  const tokenRef = useRef<symbol>(Symbol('global-shortcut-lock'));

  useEffect(() => {
    if (!isLocked) {
      return;
    }

    const token = tokenRef.current;
    lock(token);

    return () => {
      unlock(token);
    };
  }, [isLocked]);
};

const lock = (token: symbol) => {
  const before = activeTokens.size;
  activeTokens.add(token);

  if (activeTokens.size !== before) {
    notifySubscribers();
  }
};

const notifySubscribers = () => {
  for (const onChange of subscribers) {
    onChange();
  }
};

const unlock = (token: symbol) => {
  if (activeTokens.delete(token)) {
    notifySubscribers();
  }
};

export const useAreGlobalShortcutsLocked = () =>
  useSyncExternalStore(
    subscribe,
    deriveShortcutLockSnapshot,
    deriveShortcutLockSnapshot,
  );

const subscribe = (listener: () => void) => {
  subscribers.add(listener);

  return () => {
    subscribers.delete(listener);
  };
};

const deriveShortcutLockSnapshot = () => activeTokens.size > 0;
