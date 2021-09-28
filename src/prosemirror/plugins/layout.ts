import { Node as PMNode } from 'prosemirror-model';
import { Plugin, PluginKey, Selection } from 'prosemirror-state';
import { DecorationSet, Decoration } from 'prosemirror-view';
import { toggleLayoutSection } from '../commands/layout';
import {
  addRedBorders,
  hasRedBorderDecorations,
  addToolbar,
} from './layout-decorations';
import type { TextPosition, NodePositions } from './layout-utils';
import {
  isLayoutSection,
  findInvalidTextPositions,
  findLayoutNumberSectionParent,
  isLayoutNumberSection,
} from './layout-utils';

const pluginKey = new PluginKey('layoutPluginKey');

export const createLayoutPlugin = (): Plugin => {
  return new Plugin({
    key: pluginKey,
    state: {
      init: () => {
        return { decorationSet: DecorationSet.empty };
      },
      apply: (tr, oldPluginState) => {
        const metadata = tr.getMeta(pluginKey);
        const currentDecorationSet = oldPluginState.decorationSet;
        if (!metadata) {
          const nextDecorationSet = currentDecorationSet.map(
            tr.mapping,
            tr.doc,
          );

          const decorationSetWithToolbar = addToolbar()({
            tr,
            currentDecorationSet: nextDecorationSet,
          });

          return {
            decorationSet: decorationSetWithToolbar,
          };
        }

        if (metadata.action === 'ADD_RED_BORDER') {
          const layoutNodePositions = metadata.params;

          return {
            decorationSet: addRedBorders({ layoutNodePositions })({
              tr,
              currentDecorationSet,
            }),
          };
        } else if (metadata.action === 'CLEAN_RED_BORDER') {
          return {
            decorationSet: addRedBorders(null)({
              tr,
              currentDecorationSet,
            }),
          };
        }

        return oldPluginState;
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
        return pluginKey.getState(editorState).decorationSet;
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
          const currentDecorationSet = pluginKey.getState(view.state)
            .decorationSet;

          if (hasRedBorderDecorations(currentDecorationSet)) {
            const { tr } = view.state;
            tr.setMeta(pluginKey, {
              action: 'CLEAN_RED_BORDER',
              params: nodePositions,
            });

            view.dispatch(tr);
          }

          return false;
        }

        const isNumberKey = !Number.isNaN(Number(event.key));
        if (!isNumberKey) {
          const { tr } = view.state;
          tr.setMeta(pluginKey, {
            action: 'ADD_RED_BORDER',
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
