import React from 'react';
import ReactDOM from 'react-dom';
import { Node as PMNode } from 'prosemirror-model';
import { Transaction, Selection } from 'prosemirror-state';
import { EditorView, DecorationSet, Decoration } from 'prosemirror-view';
import { Toolbar } from './layout-toolbar';
import { findLayoutParent, findLayoutSections } from './layout-utils';
import type { NodePositions } from './layout-utils';

type UpdateDecorationSet = (props: {
  tr: Transaction;
  currentDecorationSet: DecorationSet;
}) => DecorationSet;

const RED_BORDER_DECORATION_KEY = 'layout_red_border_decoration_key';

export const addRedBorders = (
  props: Record<'layoutNodePositions', NodePositions> | null,
): UpdateDecorationSet => ({ tr, currentDecorationSet }) => {
  const spec = {
    key: RED_BORDER_DECORATION_KEY,
  };
  const attributes = {
    class: 'layout-number-section__invalid',
  };

  const toAddDecorations: Array<Decoration> = [];

  if (props) {
    const { layoutNodePositions } = props;

    toAddDecorations.push(
      Decoration.node(
        layoutNodePositions.wrappingPositions.startPos,
        layoutNodePositions.wrappingPositions.endPos,
        attributes,
        spec,
      ),
    );
  }

  const isRedBorderDecoration = (spec: { [key: string]: any }) =>
    spec && spec.key === RED_BORDER_DECORATION_KEY;

  const toRemoveDecorations: Array<Decoration> = currentDecorationSet.find(
    undefined,
    undefined,
    isRedBorderDecoration,
  );

  return currentDecorationSet
    .remove(toRemoveDecorations)
    .add(tr.doc, toAddDecorations);
};

export const hasRedBorderDecorations = (
  decorationSet: DecorationSet,
): boolean => {
  const isRedBorderDecoration = (spec: { [key: string]: any }) =>
    spec && spec.key === RED_BORDER_DECORATION_KEY;
  const result: Array<Decoration> = decorationSet.find(
    undefined,
    undefined,
    isRedBorderDecoration,
  );

  return result.length > 0;
};

const CONTROLS_DECORATION_KEY = 'control_decoration_key__';
const removeToolbar = (): UpdateDecorationSet => ({
  tr,
  currentDecorationSet,
}) => {
  const isToolbarDecoration = (spec: { [key: string]: any }) =>
    spec && (spec.key || '').startsWith(CONTROLS_DECORATION_KEY);

  const toRemoveDecorations: Array<Decoration> = currentDecorationSet.find(
    undefined,
    undefined,
    isToolbarDecoration,
  );

  return currentDecorationSet.remove(toRemoveDecorations);
};

export const addToolbar = (): UpdateDecorationSet => props => {
  const { tr, currentDecorationSet } = props;

  const layoutPositions = findLayoutParent(tr.selection);
  if (!layoutPositions) {
    return removeToolbar()(props);
  }

  const nextDecorationSet = removeToolbar()(props);
  const renderDOM = (editorView: EditorView) => {
    const element = document.createElement('div');

    element.classList.add('layout-node__toolbar');
    ReactDOM.render(
      <Toolbar editorState={editorView.state} dispatch={editorView.dispatch} />,
      element,
    );

    return element;
  };

  const { selection } = tr;
  const rangeSelection = `__${selection.from}__${selection.to}`;
  const spec = {
    key: CONTROLS_DECORATION_KEY.concat(rangeSelection),
  };

  const toolbarPosition = layoutPositions.innerPositions.startPos;
  const toolBarDecoration = Decoration.widget(toolbarPosition, renderDOM, spec);
  const toAddDecorations = [toolBarDecoration];

  return nextDecorationSet.add(tr.doc, toAddDecorations);
};

export const addSelectionBorders = (): UpdateDecorationSet => props => {
  const { currentDecorationSet, tr } = props;

  const SECTION_DECORATION_KEY = 'layout_section_border__decoration-key';
  const isSelectionBorderDecoration = (spec: { [key: string]: any }) =>
    spec && (spec.key || '').startsWith(SECTION_DECORATION_KEY);
  const toRemoveDecorations: Array<Decoration> = currentDecorationSet.find(
    undefined,
    undefined,
    isSelectionBorderDecoration,
  );

  const sections = findLayoutSections(tr.selection);
  const toAddDecorations: Array<Decoration> = sections.map(
    (nodePositions: NodePositions) => {
      const { wrappingPositions } = nodePositions;
      const keyPrefix = `__${nodePositions.wrappingPositions.startPos}`;
      const spec = {
        key: SECTION_DECORATION_KEY.concat(keyPrefix),
      };
      const attrs = {
        class: 'section-selected',
      };

      return Decoration.node(
        wrappingPositions.startPos,
        wrappingPositions.endPos,
        attrs,
        spec,
      );
    },
  );

  return currentDecorationSet
    .remove(toRemoveDecorations)
    .add(tr.doc, toAddDecorations);
};
