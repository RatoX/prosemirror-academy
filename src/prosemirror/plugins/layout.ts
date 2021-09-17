import { Node as PMNode } from 'prosemirror-model';
import { Plugin, PluginKey, Selection } from 'prosemirror-state';
import { DecorationSet, Decoration } from 'prosemirror-view';
import { toggleLayoutSection } from '../commands/layout';

type NodePositions = {
  startPos: number;
  endPos: number;
  node: PMNode;
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
    node: grandParentNode,
  };
};

const isLayoutSection = (node: PMNode) => {
  return node.type.name === 'layoutSection';
};
const isLayoutNumberSection = (node: PMNode) => {
  return node.type.name === 'layoutNumberSection';
};
type TextPosition = {
  startPos: number;
  endPos: number;
};
const findInvalidTextPositions = (
  node: PMNode,
  positionOffset: number,
): Array<TextPosition> => {
  const result: Array<TextPosition> = [];

  const findAllNonNumberRegex = /(\D+)/g;
  const {
    type: {
      schema: {
        marks: { weird: weirdMarkType },
      },
    },
  } = node;

  const callback = (childNode: PMNode, position: number) => {
    if (!childNode.isText || weirdMarkType.isInSet(childNode.marks)) {
      return false;
    }

    const textContent = childNode.text || '';
    const matches = [...textContent.matchAll(findAllNonNumberRegex)];

    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      if (!match || match.index === undefined) {
        continue;
      }

      const startPos = match.index + position;
      const endPos = startPos + match[0].length;

      result.push({
        startPos,
        endPos,
      });
    }
  };

  node.nodesBetween(0, node.content.size, callback, positionOffset);

  return result;
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
          const newDecorations = oldPluginState.decorations.map(
            tr.mapping,
            tr.doc,
          );

          return {
            decorations: newDecorations,
          };
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

    appendTransaction(transactions, oldEditorState, newEditorState) {
      const hasDocumentChanged = transactions.some(tr => tr.docChanged);
      if (hasDocumentChanged) {
        return null;
      }

      const invalidDataPositions: Array<TextPosition> = [];
      const callback = (node: PMNode, position: number, parentNode: PMNode) => {
        const isParentANumberSection = isLayoutNumberSection(parentNode);
        const isParentALayoutSection = isLayoutSection(parentNode);

        if (isParentANumberSection) {
          const offset = position + 1;
          const positions: Array<TextPosition> = findInvalidTextPositions(
            node,
            offset,
          );
          invalidDataPositions.push(...positions);
        }

        if (isParentANumberSection || isParentALayoutSection) {
          return false;
        }

        return true;
      };

      newEditorState.doc.nodesBetween(
        0,
        newEditorState.doc.content.size,
        callback,
      );

      const {
        tr,
        schema: {
          marks: { weird: weirdMarkType },
        },
      } = newEditorState;

      invalidDataPositions.forEach(textPosition => {
        const weirdMark = weirdMarkType.create({
          source: 'unknown',
          createdAt: new Date().getTime(),
        });
        tr.addMark(textPosition.startPos, textPosition.endPos, weirdMark);
      });

      if (tr.docChanged) {
        return tr;
      }

      return null;
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
