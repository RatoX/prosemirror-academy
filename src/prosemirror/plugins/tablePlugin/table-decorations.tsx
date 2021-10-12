import { Transaction } from 'prosemirror-state';
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';
import React from 'react';
import ReactDOM from 'react-dom';
import { findParentNodeOfSelection } from '../../utils';
import { Toolbar } from './toolbar';

type UpdateDecorationSet = (props: {
  tr: Transaction;
  currentDecorationSet: DecorationSet;
  startCoord: string;
  endCoord: string;
}) => DecorationSet;

const TOOLBAR_DECORATION_KEY = 'toolbar_decoration_key__';

const isToolbarDecoration = (spec: { [key: string]: any }) =>
  spec && (spec.key || '').startsWith(TOOLBAR_DECORATION_KEY);

export const removeToolbar = (): UpdateDecorationSet => props => {
  const { currentDecorationSet } = props;
  const toRemoveDecorations: Array<Decoration> = currentDecorationSet.find(
    undefined,
    undefined,
    isToolbarDecoration,
  );
  return currentDecorationSet.remove(toRemoveDecorations);
};

export const addToolbar = (): UpdateDecorationSet => props => {
  const { tr, currentDecorationSet, startCoord, endCoord } = props;
  const {
    doc: {
      type: {
        schema: {
          nodes: { table: tableNodeType },
        },
      },
    },
    selection,
  } = tr;
  const selectedTable = findParentNodeOfSelection(selection, tableNodeType);

  if (!selectedTable) {
    return removeToolbar()(props);
  }
  const [currentToolbar]: Array<Decoration> = currentDecorationSet.find(
    undefined,
    undefined,
    isToolbarDecoration,
  );
  const nextDecorationSet = removeToolbar()(props);
  const toDOM = (editorView: EditorView) => {
    const element = document.createElement('div');
    element.classList.add('table__node-toolbar');
    ReactDOM.render(
      <Toolbar
        startCoordProp={startCoord}
        endCoordProp={endCoord}
        editorState={editorView.state}
        dispatch={editorView.dispatch}
      />,
      element,
    );
    return element;
  };
  const toolbarPosition = selectedTable.innerEndPosition;
  const previosRandomNum = currentToolbar?.spec?.randomNum || '';
  const randomNum = tr.docChanged
    ? Math.ceil(Math.random() * 10000)
    : previosRandomNum;
  const spec = {
    key: TOOLBAR_DECORATION_KEY.concat(randomNum),
    randomNum,
  };
  const toolBarDecoration = Decoration.widget(toolbarPosition, toDOM, spec);
  const toAddDecorations = [toolBarDecoration];
  return nextDecorationSet.add(tr.doc, toAddDecorations);
};
