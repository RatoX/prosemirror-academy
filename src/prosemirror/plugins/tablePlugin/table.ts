import { Plugin, PluginKey, StateField, Transaction } from 'prosemirror-state';
import { DecorationSet } from 'prosemirror-view';
import { TablePluginState } from '../../../types';
import { addToolbar } from './table-decorations';

export const tablePluginKey = new PluginKey('tablePlugin');

export const createTablePlugin = (): Plugin<StateField<TablePluginState>> => {
  return new Plugin({
    key: tablePluginKey,
    state: {
      init(): TablePluginState {
        return {
          decorationSet: DecorationSet.empty,
          startCoord: '',
          endCoord: '',
        };
      },
      apply(
        tr: Transaction,
        oldPluginState: TablePluginState,
      ): TablePluginState {
        const metadata = tr.getMeta(tablePluginKey);
        const currentDecorationSet = oldPluginState.decorationSet;
        const mappedDecorationSet = currentDecorationSet.map(
          tr.mapping,
          tr.doc,
        );
        let startCoord = oldPluginState.startCoord;
        let endCoord = oldPluginState.endCoord;
        if (metadata && metadata.action === 'RANGE_SUM_UPDATE') {
          const { name, value } = metadata;
          if (name === 'startCoord') {
            startCoord = value;
          } else if (name === 'endCoord') {
            endCoord = value;
          }
        }
        const newDecorationSet = addToolbar()({
          tr,
          currentDecorationSet: mappedDecorationSet,
          startCoord,
          endCoord,
        });
        return {
          ...oldPluginState,
          decorationSet: newDecorationSet,
          startCoord,
          endCoord,
        };
      },
    },
    props: {
      decorations(editorState) {
        return tablePluginKey.getState(editorState).decorationSet;
      },
    },
  });
};
