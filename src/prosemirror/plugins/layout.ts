import { Plugin, PluginKey, Selection } from 'prosemirror-state';
import { DecorationSet, Decoration } from 'prosemirror-view';
import { toggleLayoutSection } from '../commands/layout';

type NodePositions = {
  startPos: number;
  endPos: number;
};
const findLayoutNumberSectionParent = (
  selection: Selection,
): NodePositions | null => {
  const $from = selection.$from;
  if ($from.depth < 3) {
    return null;
  }

  const grandParentDepth = $from.depth - 1;
  const grandParentNode = $from.node(grandParentDepth);
  const isInsideALayoutNumberSection =
    grandParentNode && grandParentNode.type.name === 'layoutNumberSection';

  if (!isInsideALayoutNumberSection) {
    return null;
  }

  const startPos = $from.before(grandParentDepth);
  const endPos = startPos + grandParentNode.nodeSize;
  return {
    startPos,
    endPos,
  };
};

const pluginKey = new PluginKey('layoutPluginKey');

export const createLayoutPlugin = (): Plugin => {
  return new Plugin({
    key: pluginKey,
    state: {
      init: () => {
        return { decorations: DecorationSet.empty };
      },
      apply: (tr, oldPluginState) => {
        const metadata = tr.getMeta(pluginKey);
        if (!metadata) {
          return { decorations: DecorationSet.empty };
        }
        const attributes = {
          class: 'layout-number-section__invalid',
        };
        const decoration = Decoration.node(
          metadata.startPos,
          metadata.endPos,
          attributes,
        );
        const nextDecorationSet = DecorationSet.create(tr.doc, [decoration]);
        return { decorations: nextDecorationSet };
      },
    },
    props: {
      decorations(editorState) {
        return pluginKey.getState(editorState).decorations;
      },
      handleKeyDown(view, event) {
        if (event.shiftKey && event.ctrlKey && event.key === 'T') {
          return toggleLayoutSection(view.state, view.dispatch);
        }

        const { selection } = view.state;
        const nodePositions: NodePositions | null = findLayoutNumberSectionParent(
          selection,
        );
        if (!nodePositions) {
          return false;
        }

        const isLetter = /^[a-z]$/i.test(event.key);
        const isNumber = /^[0-9]$/i.test(event.key);
        const isShorcut = event.metaKey || event.ctrlKey;
        if (isNumber || !isLetter || isShorcut) {
          return false;
        }

        const isNumberKey = !Number.isNaN(Number(event.key));
        if (!isNumberKey) {
          const { tr } = view.state;
          tr.setMeta(pluginKey, nodePositions);
          view.dispatch(tr);
          return true;
        }

        return false;
      },
    },
  });
};
