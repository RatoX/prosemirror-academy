import {
  EditorState,
  Plugin,
  PluginKey,
  StateField,
  Transaction,
} from 'prosemirror-state';
import { TablePluginState } from '../../types';

const tablePluginKey = new PluginKey('tablePlugin');

export const createTablePlugin = (): Plugin<StateField<TablePluginState>> => {
  return new Plugin({
    key: tablePluginKey,
    state: {
      init(): TablePluginState {
        return {};
      },
      apply(tr: Transaction): TablePluginState {
        return;
      },
    },
  });
};
