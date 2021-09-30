import { Plugin, PluginKey, StateField, Transaction } from 'prosemirror-state';
import { TablePluginState } from '../../types';
import { printRowAndColSum, findParentNodeOfSelection } from '../utils';

const tablePluginKey = new PluginKey('tablePlugin');

export const createTablePlugin = (): Plugin<StateField<TablePluginState>> => {
  return new Plugin({
    key: tablePluginKey,
    state: {
      init(): TablePluginState {
        return {};
      },
      apply(tr: Transaction): TablePluginState {
        const {
          selection,
          doc: {
            type: { schema },
          },
        } = tr;
        const {
          nodes: { tableCell },
        } = schema;

        if (tr.selectionSet && selection.$from.depth >= 3) {
          const currentTableCell = findParentNodeOfSelection(
            selection,
            tableCell,
          );
          if (currentTableCell) {
            printRowAndColSum({
              selection,
            });
          }
        }
        return;
      },
    },
  });
};
