import { Plugin, PluginKey, StateField, Transaction } from 'prosemirror-state';
import { TablePluginState } from '../../types';

const tablePluginKey = new PluginKey('tablePlugin');

// Basic Plugin Setup
export const createTablePlugin = (): Plugin<StateField<TablePluginState>> => {
  return new Plugin({
    key: tablePluginKey,
    props: {},
    state: {
      init(): TablePluginState {
        return {};
      },
      apply(
        _tr: Transaction,
        oldPluginState: TablePluginState,
      ): TablePluginState {
        return oldPluginState;
      },
    },
  });
};
