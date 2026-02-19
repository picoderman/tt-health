import { useState, useEffect, useRef, useMemo } from 'react';
import useLatestCallback from 'use-latest-callback';

import {
  retrieveAppState,
  setAppState,
  subscribeToState,
  unsubscribeFromState,
} from './state.js';

type SetStateAction<T> = T | ((prevState: T) => T);

export const useAppState = <T>(key: string, defaultValue: T) => {
  const [value, setValue] = useState<T>(() =>
    retrieveAppState(key, defaultValue),
  );
  const keyRef = useRef(key);
  const valueRef = useRef(value);

  // DO: how?
  // eslint-disable-next-line react-hooks/refs
  keyRef.current = key;
  // eslint-disable-next-line react-hooks/refs
  valueRef.current = value;

  const onStateChange = useLatestCallback(
    (changedKey: string, newValue: unknown) => {
      if (changedKey === keyRef.current) {
        setValue(newValue as T);
        valueRef.current = newValue as T;
      }
    },
  );

  useEffect(() => {
    subscribeToState(onStateChange);
    return () => {
      unsubscribeFromState(onStateChange);
    };
  }, [onStateChange]);

  const setPersistedValue = useLatestCallback((action: SetStateAction<T>) => {
    const newValue =
      typeof action === 'function'
        ? (action as (prevState: T) => T)(valueRef.current)
        : action;
    setValue(newValue);
    valueRef.current = newValue;
    setAppState(key, newValue);
  });

  return useMemo(() => {
    return [value, setPersistedValue] as const;
  }, [value, setPersistedValue]);
};
