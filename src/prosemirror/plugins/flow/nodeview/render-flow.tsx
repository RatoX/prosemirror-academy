import React, { useCallback, useState } from 'react';
import ReactDOM from 'react-dom';
import ReactFlow, {
  addEdge,
  Background,
  BackgroundVariant,
  Connection,
  Edge,
  ElementId,
  Elements as FlowElements,
  FlowElement,
  Handle,
  OnLoadParams,
  Position,
  ReactFlowProvider,
  useStoreState,
} from 'react-flow-renderer';
import { Fragment, Node as PMNode, Schema } from 'prosemirror-model';
import { Decoration, EditorView, NodeView } from 'prosemirror-view';
import { NodeSelection } from 'prosemirror-state';
import { CustomTextElement } from './ui/custom-text-element';
import { BasicFlow } from './ui/basic-flow';
import { FlowEventsContext } from './context';
import {
  convertFlowGraphNodeToElements,
  convertElementsToFlowGraphNode,
} from './convertions';

const setSelection = (view: EditorView, position: number) => {
  const { state } = view;
  const tr = state.tr;
  const nodeSelection = new NodeSelection(state.doc.resolve(position));

  tr.setSelection(nodeSelection);
  view.dispatch(tr);
};

type ElementAttributes = {
  [keyof: string]: any;
};

type RenderFlowProps = {
  dom: HTMLElement;
  getPosition: () => number;
  node: PMNode;
  view: EditorView;
};
export const renderFlow = ({
  dom,
  getPosition,
  node,
  view,
}: RenderFlowProps): void => {
  const schema = view.state.schema;
  const onPaneClick = () => {
    const position = getPosition();
    setSelection(view, position);
  };
  const onElementClick = (_: React.MouseEvent, element: FlowElement) => {
    const position = getPosition();
    const { doc } = view.state;
    const flowGraphNode = doc.nodeAt(position);

    if (!flowGraphNode) {
      return;
    }
    const elements = convertFlowGraphNodeToElements({
      node: flowGraphNode,
    });

    const elementIndex = elements.findIndex(
      (e: ElementAttributes) => e.id === element.id,
    );
    const flowElementPosition = position + elementIndex + 1;
    const flowElementNode = doc.nodeAt(flowElementPosition);
    if (!flowElementNode) {
      return;
    }

    setSelection(view, flowElementPosition);
  };

  const onElementsChange = (elements: FlowElements) => {
    const fragment = convertElementsToFlowGraphNode({ elements, schema });
    const position = getPosition();
    const { tr } = view.state;
    const flowGraphNode = tr.doc.nodeAt(position);

    if (!flowGraphNode) {
      return false;
    }

    tr.replaceWith(position, position + flowGraphNode.nodeSize, fragment);

    view.dispatch(tr);
  };

  const onElementDataChange = (props: { id: ElementId; newData: any }) => {
    const { id, newData } = props;
    const position = getPosition();
    const { doc } = view.state;
    const flowGraphNode = doc.nodeAt(position);
    console.log('dddd');

    if (!flowGraphNode) {
      return;
    }

    flowGraphNode.forEach((node, _, elementIndex) => {
      if (node.attrs.id !== id) {
        return;
      }

      const flowElementPosition = position + elementIndex + 1;
      const flowElementNode = doc.nodeAt(flowElementPosition);
      if (!flowElementNode) {
        return;
      }

      const tr = view.state.tr;
      const data = {
        ...(flowElementNode.attrs.data || {}),
        ...newData,
      };
      tr.setNodeMarkup(flowElementPosition, undefined, {
        ...flowElementNode.attrs,
        data,
      });
      view.dispatch(tr);
    });
  };

  const blurEditorView = () => {};
  const focusEditorView = () => {};

  ReactDOM.render(
    <FlowEventsContext.Provider
      value={{
        onFlowSelect: onPaneClick,
        onContentChange: onElementsChange,
        onElementSelect: onElementClick,
        onElementDataChange,
        blurEditorView,
        focusEditorView,
      }}
    >
      <BasicFlow elements={convertFlowGraphNodeToElements({ node })} />
    </FlowEventsContext.Provider>,
    dom,
  );
};
