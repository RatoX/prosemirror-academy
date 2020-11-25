import {
  EditorState,
  Plugin,
  PluginKey,
  StateField,
  Transaction,
  NodeSelection,
} from 'prosemirror-state';
import { FlowPluginState } from '../../../types';
import { view as flowGraph } from './nodeview';
import { EditorView } from 'prosemirror-view';
import { Node as PMNode } from 'prosemirror-model';

export const pluginKey = new PluginKey('flow');

const isFlowNode = (node: PMNode): boolean => {
  return ['flowGraph', 'flowElement', 'flowTextElement'].includes(
    node.type.name,
  );
};

export const createFlowPlugin = (): Plugin<StateField<FlowPluginState>> => {
  return new Plugin({
    key: pluginKey,
    state: {
      init(_config, _state: EditorState): FlowPluginState {
        return {};
      },

      apply(
        tr: Transaction,
        oldPluginState: FlowPluginState,
        _oldState: EditorState,
        _newState: EditorState,
      ): FlowPluginState {
        return oldPluginState;
      },
    },
    props: {
      nodeViews: {
        flowGraph,
      },
      handleKeyPress(view: EditorView, event: KeyboardEvent): boolean {
        const {
          state: { selection },
        } = view;

        if (!(selection instanceof NodeSelection)) {
          return false;
        }
        const isRemoveNodeAction = ['Backspace', 'Delete'].includes(event.key);
        const { node } = selection;

        return isFlowNode(node) && !isRemoveNodeAction;
      },
    },
  });
};
