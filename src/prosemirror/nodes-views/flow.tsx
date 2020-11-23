import React from 'react';
import ReactDOM from 'react-dom';
import ReactFlow, {
  addEdge,
  Background,
  BackgroundVariant,
  OnLoadParams,
  FlowElement,
  Elements as FlowElements,
  useStoreState,
  Edge,
  Connection,
} from 'react-flow-renderer';
import { Node as PMNode, Fragment, Schema } from 'prosemirror-model';
import { EditorView, Decoration, NodeView } from 'prosemirror-view';
import { NodeSelection } from 'prosemirror-state';

type MutationSelection = {
  type: 'selection';
  target: Element;
};

type ElementAttributes = {
  [keyof: string]: any;
};

const ElementsWatch = () => {
  // prettier-ignore
  const elements = useStoreState(state => {
    return state.elements;
  });
  console.log(elements);
  return null;
};

type BasicFlowProps = {
  elements: FlowElements;
  onPaneClick: () => void;
  onElementClick: (event: React.MouseEvent, element: FlowElement) => void;
  onElementsChange: (elements: FlowElements) => void;
};
const BasicFlow: React.FC<BasicFlowProps> = ({
  elements,
  onPaneClick,
  onElementClick,
  onElementsChange,
}) => {
  const [instance, setInstance] = React.useState<OnLoadParams>();
  const onNodeDragStop = React.useCallback(() => {
    if (!instance) {
      return;
    }

    onElementsChange(instance.toObject().elements);
  }, [instance]);
  const onConnect = React.useCallback(
    (edges: Edge | Connection) => {
      const nextElements = addEdge(edges, elements);
      onElementsChange(nextElements);
    },
    [elements],
  );
  const onLoad = React.useCallback((instance: OnLoadParams) => {
    instance.fitView();
    setInstance(instance);
  }, []);

  return (
    <ReactFlow
      onLoad={onLoad}
      snapToGrid={true}
      snapGrid={[15, 15]}
      elements={elements}
      maxZoom={1.5}
      onPaneClick={onPaneClick}
      onElementClick={onElementClick}
      onNodeDragStop={onNodeDragStop}
      onConnect={onConnect}
    >
      <ElementsWatch />
      <Background variant={BackgroundVariant.Lines} />
    </ReactFlow>
  );
};

type ConvertElementsToFlowGraphNodeProps = {
  elements: FlowElements;
  schema: Schema;
};
const convertElementsToFlowGraphNode = ({
  elements,
  schema,
}: ConvertElementsToFlowGraphNodeProps): Fragment => {
  const {
    nodes: { flow_element, flow_edge },
  } = schema;
  const nodes: PMNode[] = elements.map((e: FlowElement) => {
    if (e.data) {
      return flow_element.createChecked({ ...e });
    }

    return flow_edge.createChecked({ ...e });
  });

  return Fragment.from(nodes);
};

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

  ReactDOM.render(
    <BasicFlow
      onPaneClick={onPaneClick}
      onElementClick={onElementClick}
      onElementsChange={onElementsChange}
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
