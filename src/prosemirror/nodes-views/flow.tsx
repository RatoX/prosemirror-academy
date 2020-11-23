import React from 'react';
import ReactDOM from 'react-dom';
import ReactFlow, {
  Background,
  BackgroundVariant,
  OnLoadParams,
  FlowElement,
  Elements as FlowElements,
  useStoreState,
} from 'react-flow-renderer';
import { Node as PMNode } from 'prosemirror-model';
import { EditorView, Decoration, NodeView } from 'prosemirror-view';
import { NodeSelection } from 'prosemirror-state';

type MutationSelection = {
  type: 'selection';
  target: Element;
};

type ElementAttributes = {
  [keyof: string]: any;
};

const onLoad = (instance: OnLoadParams) => {
  instance.fitView();
};

const ElementsDebugger = () => {
  const elements = useStoreState((state) => state.elements);
  console.log(elements);
  return null;
};

type BasicFlowProps = {
  elements: FlowElements;
  onPaneClick: () => void;
  onElementClick: (event: React.MouseEvent, element: FlowElement) => void;
};
const BasicFlow: React.FC<BasicFlowProps> = ({
  elements,
  onPaneClick,
  onElementClick,
}) => (
  <ReactFlow
    onLoad={onLoad}
    snapToGrid={true}
    snapGrid={[15, 15]}
    elements={elements}
    maxZoom={1.5}
    onPaneClick={onPaneClick}
    onElementClick={onElementClick}
  >
    <ElementsDebugger />
    <Background variant={BackgroundVariant.Lines} />
  </ReactFlow>
);

const convertFlowGraphNodeToElements = (node: PMNode): FlowElements => {
  const elements: ElementAttributes = [];
  node.forEach((childNode: PMNode) => {
    const elementAttrs = {
      ...childNode.attrs,
    };
    elements.push(elementAttrs);
  });

  return elements as FlowElements;
};

const setSelection = (view: EditorView, position: number) => {
  const { state } = view;
  const tr = state.tr;
  const nodeSelection = new NodeSelection(state.doc.resolve(position));

  tr.setSelection(nodeSelection);
  view.dispatch(tr);
};

type FlowViewProps = {
  node: PMNode;
  view: EditorView;
  getNodePosition: boolean | (() => number);
};

type RenderFlowProps = {
  dom: HTMLElement;
  getPosition: () => number;
  node: PMNode;
  view: EditorView;
};

const renderFlow = ({ dom, getPosition, node, view }: RenderFlowProps) => {
  const onPaneClick = () => {
    const position = getPosition();
    setSelection(view, position);
  };

  const onElementClick = (_: React.MouseEvent, element: FlowElement) => {
    const position = getPosition();
    const { doc } = view.state;
    const flowGraphNode = doc.nodeAt(position);

    if (!flowGraphNode) {
      return false;
    }
    const elements = convertFlowGraphNodeToElements(flowGraphNode);

    const elementIndex = elements.findIndex(
      (e: ElementAttributes) => e.id === element.id,
    );
    const flowElementPosition = position + elementIndex + 1;
    const flowElementNode = doc.nodeAt(flowElementPosition);
    if (!flowElementNode) {
      return false;
    }

    setSelection(view, flowElementPosition);
  };

  ReactDOM.render(
    <BasicFlow
      onPaneClick={onPaneClick}
      onElementClick={onElementClick}
      elements={convertFlowGraphNodeToElements(node)}
    />,
    dom,
  );
};

class FlowView implements NodeView {
  dom: HTMLElement;
  getPosition: () => number;
  view: EditorView;

  constructor({ view, node, getNodePosition }: FlowViewProps) {
    console.log('FlowView Created');
    this.dom = document.createElement('figure');
    this.dom.classList.add('flow');
    this.view = view;

    const getPosition =
      getNodePosition instanceof Function ? getNodePosition : () => 0;
    this.getPosition = getPosition;
    renderFlow({ dom: this.dom, getPosition, node, view });
  }

  update(node: PMNode) {
    renderFlow({
      dom: this.dom,
      getPosition: this.getPosition,
      node,
      view: this.view,
    });
    return true;
  }

  stopEvent(event: Event) {
    return true;
  }

  ignoreMutation(mut: MutationRecord | MutationSelection) {
    return true;
  }

  destroy() {
    console.log('destroy');
  }
}

const view = (
  node: PMNode,
  view: EditorView,
  getPos: boolean | (() => number),
  decorations: Decoration[],
): NodeView => {
  return new FlowView({
    node,
    view,
    getNodePosition: getPos,
  });
};

export { view };
