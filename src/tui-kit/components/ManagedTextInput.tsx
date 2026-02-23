import TextInput, { type Props as TextInputProps } from 'ink-text-input';
import type { FC } from 'react';

import { useGlobalShortcutLock } from '../hooks/useGlobalShortcutLock.ts';

export type ManagedTextInputProps = TextInputProps;

export const ManagedTextInput: FC<ManagedTextInputProps> = (props) => {
  const isFocused = props.focus ?? true;

  useGlobalShortcutLock(isFocused);

  return <TextInput {...props} />;
};
