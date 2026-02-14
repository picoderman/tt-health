import { useState, useCallback, useEffect, useRef } from 'react';

import {
  getAppState,
  setAppState,
  subscribeToState,
  unsubscribeFromState,
} from './state.js';

type SetStateAction<T> = T | ((prevState: T) => T);

export function useAppState<T>(
  key: string,
  defaultValue: T,
): [T, (value: SetStateAction<T>) => void] {
  const [value, setValue] = useState<T>(() => getAppState(key, defaultValue));
  const keyRef = useRef(key);
  const valueRef = useRef(value);

  // DO: how?
  // eslint-disable-next-line react-hooks/refs
  keyRef.current = key;
  // eslint-disable-next-line react-hooks/refs
  valueRef.current = value;

  useEffect(() => {
    const handler = (changedKey: string, newValue: unknown) => {
      if (changedKey === keyRef.current) {
        setValue(newValue as T);
        valueRef.current = newValue as T;
      }
    };

    subscribeToState(handler);
    return () => unsubscribeFromState(handler);
  }, []);

  const setPersistedValue = useCallback(
    (action: SetStateAction<T>) => {
      const newValue =
        typeof action === 'function'
          ? (action as (prevState: T) => T)(valueRef.current)
          : action;
      setValue(newValue);
      valueRef.current = newValue;
      setAppState(key, newValue);
    },
    [key],
  );

  return [value, setPersistedValue];
}
