import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import stringify from 'safe-stable-stringify';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STATE_PATH = join(__dirname, 'state.json');

export type State = {
  appState: Record<string, unknown>;
};

const defaultState: State = {
  appState: {},
};

export type StateChangeHandler = (key: string, value: unknown) => void;
const subscribers = new Set<StateChangeHandler>();

export const subscribeToState = (handler: StateChangeHandler) => {
  subscribers.add(handler);
};

export const unsubscribeFromState = (handler: StateChangeHandler) => {
  subscribers.delete(handler);
};

export const retrieveAppState = <T>(key: string, defaultValue: T) => {
  const state = loadState();

  if (key in state.appState) {
    // It's okay
    // eslint-disable-next-line @blumintinc/blumint/no-type-assertion-returns
    return state.appState[key] as T;
  }

  return defaultValue;
};

const notifySubscribers = (key: string, value: unknown) => {
  for (const onStateChange of subscribers) {
    onStateChange(key, value);
  }
};

export const saveState = (state: State) => {
  writeFileSync(STATE_PATH, stringify(state, null, 2));
};

export const loadState = () => {
  if (!existsSync(STATE_PATH)) {
    return defaultState;
  }
  try {
    const content = readFileSync(STATE_PATH, 'utf-8');
    const parsed = JSON.parse(content) as { appState?: unknown };

    const appState =
      typeof parsed.appState === 'object' &&
      parsed.appState !== null &&
      !Array.isArray(parsed.appState)
        ? (parsed.appState as Record<string, unknown>)
        : {};

    return { appState } as const;
  } catch {
    return defaultState;
  }
};

export const setAppState = (key: string, value: unknown) => {
  const state = loadState();
  state.appState[key] = value;
  saveState(state);
  notifySubscribers(key, value);
};
