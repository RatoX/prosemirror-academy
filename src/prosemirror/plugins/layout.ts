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

        if (metadata.action === 'ADD_HIGHLIGHTS') {
          type HighlightType = {
            startPos: number;
            endPos: number;
          };
          const createHighlightDecoration = (
            highlight: HighlightType,
          ): Decoration => {
            const attrs = {
              class: 'layout-number-section__text-invalid',
              nodeName: 'mark',
            };
            return Decoration.inline(
              highlight.startPos,
              highlight.endPos,
              attrs,
            );
          };
          const decorations = metadata.params.map(createHighlightDecoration);

          const nextDecorationSet = DecorationSet.create(tr.doc, decorations);
          return {
            decorations: nextDecorationSet,
          };
        }

        if (metadata.action === 'NO_TIE_FOR_YOU') {
          return {
            decorations: DecorationSet.empty,
          };
        }

        const attributes = {
          class: 'layout-number-section__invalid',
        };
        const { params } = metadata;
        const decoration = Decoration.node(
          params.startPos,
          params.endPos,
          attributes,
        );
        const nextDecorationSet = DecorationSet.create(tr.doc, [decoration]);
        return { decorations: nextDecorationSet };
      },
    },

    appendTransaction(transactions, oldEditorState, newEditorState) {
      const lastTransaction = transactions[transactions.length - 1];
      if (!lastTransaction || !lastTransaction.docChanged) {
        return null;
      }

      const nodePositions = findLayoutNumberSectionParent(
        lastTransaction.selection,
      );
      if (!nodePositions) {
        return null;
      }

      const layoutTextContent = nodePositions.node.textContent;
      const isValidNumber = !Number.isNaN(Number(layoutTextContent));
      if (isValidNumber) {
        return null;
      }

      type HighlightType = {
        startPos: number;
        endPos: number;
      };
      const highlights: HighlightType[] = [];
      newEditorState.doc.nodesBetween(
        nodePositions.startPos,
        nodePositions.endPos,
        (node, textNodePosition) => {
          if (node.type.name !== 'text') {
            // keeping looking
            return true;
          }

          const findAllNonNumber = /(\D+)/g;
          const matches = node.textContent.matchAll(findAllNonNumber);
          for (const match of matches) {
            if (!match || match.index === undefined) {
              continue;
            }

            const startPos = textNodePosition + match.index;
            const endPos = startPos + match[0].length;
            highlights.push({
              startPos,
              endPos,
            });
          }
        },
      );

      const tr = newEditorState.tr;
      tr.setMeta(pluginKey, { action: 'ADD_HIGHLIGHTS', params: highlights });
      return tr;
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
          tr.setMeta(pluginKey, {
            action: 'ADD_RED_TIE',
            params: nodePositions,
          });
          view.dispatch(tr);
          return true;
        }

        return false;
      },
    },
  });
};
