import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STATE_PATH = join(__dirname, 'state.json');

interface State {
  appState: Record<string, unknown>;
}

const defaultState: State = {
  appState: {},
};

type StateChangeHandler = (key: string, value: unknown) => void;
const subscribers = new Set<StateChangeHandler>();

export function subscribeToState(handler: StateChangeHandler): void {
  subscribers.add(handler);
}

export function unsubscribeFromState(handler: StateChangeHandler): void {
  subscribers.delete(handler);
}

function notifySubscribers(key: string, value: unknown): void {
  for (const handler of subscribers) {
    handler(key, value);
  }
}

export function getAppState<T>(key: string, defaultValue: T): T {
  const state = loadState();
  if (key in state.appState) {
    return state.appState[key] as T;
  }
  return defaultValue;
}

export function setAppState<T>(key: string, value: T): void {
  const state = loadState();
  state.appState[key] = value;
  saveState(state);
  notifySubscribers(key, value);
}

export function loadState(): State {
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

    return { appState };
  } catch {
    return defaultState;
  }
}

export function saveState(state: State): void {
  writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}
