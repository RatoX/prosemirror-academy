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

type MutationSelection = {
  type: 'selection';
  target: Element;
};

type ElementAttributes = {
  [keyof: string]: any;
};

type CustomTextElementOnChangeProps = {
  id: ElementId;
  label: string;
};

type CustomTextElementOnChange = (
  props: CustomTextElementOnChangeProps,
) => void;

type CustomTextElementProps = {
  id: string;
  data: {
    label: string;
    onChange: CustomTextElementOnChange;
    blurEditorView: () => void;
    focusEditorView: () => void;
  };
};

const CustomTextElement: React.FC<CustomTextElementProps> = (props) => {
  const [editMode, setEditMode] = useState(false);
  const { data, id } = props;

  const onDoubleClick = useCallback(() => {
    setEditMode(true);
    data.blurEditorView();
  }, []);

  const handleInput = useCallback((evt) => {
    evt.stopPropagation();
    evt.preventDefault();
  }, []);

  const onInputKeyUp = useCallback((evt) => {
    evt.stopPropagation();
    evt.preventDefault();
    if (evt.key !== 'Enter') {
      return;
    }

    data.onChange({ id, label: evt.target.value });
    setEditMode(false);
    data.focusEditorView();
  }, []);

  return (
    <figure className="react-flow__node-default">
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#555' }}
      />

      {editMode ? (
        <input onInput={handleInput} onKeyUp={onInputKeyUp} type="text" />
      ) : (
        <span onDoubleClick={onDoubleClick}>{data.label}</span>
      )}

      <Handle
        type="target"
        position={Position.Bottom}
        style={{ background: '#555' }}
      />
    </figure>
  );
};

const nodeTypes = {
  textElement: CustomTextElement,
};

const ElementsWatch = () => {
  // prettier-ignore
  const elements = useStoreState(state => {
    return state.elements;
  });
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
    <ReactFlowProvider>
      <ReactFlow
        onLoad={onLoad}
        snapToGrid={true}
        snapGrid={[15, 15]}
        elements={elements}
        maxZoom={1.5}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        onElementClick={onElementClick}
        onNodeDragStop={onNodeDragStop}
        onConnect={onConnect}
      >
        <ElementsWatch />
        <Background variant={BackgroundVariant.Lines} />
      </ReactFlow>
    </ReactFlowProvider>
  );
};

const isFlowElementEdge = (flowElement: FlowElement): boolean => {
  const edge = flowElement as Edge;
  return Boolean(edge.source && edge.target);
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
    if (isFlowElementEdge(e)) {
      return flow_edge.createChecked({ ...e });
    }

    return flow_element.createChecked({ ...e });
  });

  return Fragment.from(nodes);
};

type ConvertFlowGraphNodeToElementsProps = {
  node: PMNode;
  onTextChange: (props: CustomTextElementOnChangeProps) => void;
  blurEditorView: () => void;
  focusEditorView: () => void;
};

const convertFlowGraphNodeToElements = ({
  node,
  onTextChange,
}: ConvertFlowGraphNodeToElementsProps): FlowElements => {
  const elements: ElementAttributes = [];
  node.forEach((childNode: PMNode) => {
    let elementAttrs: any = {
      ...childNode.attrs,
    };

    if (childNode.type.name === 'flow_text_element') {
      elementAttrs = {
        ...elementAttrs,
        type: 'textElement',
        data: {
          ...(elementAttrs.data || {}),
          onChange: onTextChange,
          blurEditorView: () => {
            console.log('BLUR');
          },
          focusEditorView: () => {
            console.log('FOCUS');
          },
        },
      };
    }

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

  const blurEditorView = () => {
    // view.blur();
  };

  const focusEditorView = () => {
    view.focus();
  };

  const onTextChange = (props: CustomTextElementOnChangeProps) => {
    const position = getPosition();
    const { doc } = view.state;
    const flowGraphNode = doc.nodeAt(position);

    if (!flowGraphNode) {
      return;
    }

    flowGraphNode.forEach((node, _, elementIndex) => {
      if (node.attrs.id !== props.id) {
        return;
      }

      const flowElementPosition = position + elementIndex + 1;
      const flowElementNode = doc.nodeAt(flowElementPosition);
      if (!flowElementNode) {
        return;
      }

      const tr = view.state.tr;
      tr.setNodeMarkup(flowElementPosition, undefined, {
        ...flowElementNode.attrs,
        data: {
          ...flowElementNode.attrs.data,
          label: props.label.trim() || 'NO TITLE',
        },
      });
      view.dispatch(tr);
    });
  };

  const onElementClick = (_: React.MouseEvent, element: FlowElement) => {
    const position = getPosition();
    const { doc } = view.state;
    const flowGraphNode = doc.nodeAt(position);

    if (!flowGraphNode) {
      return false;
    }
    const elements = convertFlowGraphNodeToElements({
      node: flowGraphNode,
      onTextChange,
      blurEditorView,
      focusEditorView,
    });

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
      elements={convertFlowGraphNodeToElements({
        node,
        onTextChange,
        blurEditorView,
        focusEditorView,
      })}
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
    ReactDOM.unmountComponentAtNode(this.dom);
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
