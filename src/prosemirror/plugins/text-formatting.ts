import {
  Plugin,
  EditorState,
  PluginKey,
  StateField,
  Transaction,
} from 'prosemirror-state';
import { toggleMark } from 'prosemirror-commands';
import { TextFormattingPluginState } from '../../types';
import { isMarkActive } from '../utils';

export const pluginKey = new PluginKey('textFormatting');

export const createTextFormattingPlugin = (): Plugin<StateField<
  TextFormattingPluginState
>> => {
  return new Plugin({
    key: pluginKey,
    state: {
      init(_config, state: EditorState): TextFormattingPluginState {
        return {
          strongDisabled: false,
          strongActive: false,
          headingActive: null,
          textAlignmentStatus: false,
        };
      },

      apply(
        tr: Transaction,
        oldPluginState: TextFormattingPluginState,
        _oldState: EditorState,
        newState: EditorState,
      ): TextFormattingPluginState {
        if (tr.selectionSet || tr.docChanged) {
          const {
            schema: {
              marks: { strong },
            },
          } = newState;

          return {
            ...oldPluginState,
            strongDisabled: !toggleMark(strong)(newState),
            strongActive: Boolean(isMarkActive(newState, strong)),
          };
        }

        return oldPluginState;
      },
    },
  });
};
