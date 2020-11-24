import {
  Connection,
  Edge,
  Elements as FlowElements,
  FlowElement,
} from 'react-flow-renderer';
import { Fragment, Node as PMNode, Schema } from 'prosemirror-model';

const isFlowElementEdge = (flowElement: FlowElement): boolean => {
  const edge = flowElement as Edge;
  return Boolean(edge.source && edge.target);
};

type ConvertElementsToFlowGraphNodeProps = {
  elements: FlowElements;
  schema: Schema;
};
export const convertElementsToFlowGraphNode = ({
  elements,
  schema,
}: ConvertElementsToFlowGraphNodeProps): Fragment => {
  const {
    nodes: { flowElement, flowEdge },
  } = schema;
  const nodes: PMNode[] = elements.map((e: FlowElement) => {
    if (isFlowElementEdge(e)) {
      return flowEdge.createChecked({ ...e });
    }

    return flowElement.createChecked({ ...e });
  });

  return Fragment.from(nodes);
};

type ElementAttributes = {
  [keyof: string]: any;
};

type ConvertFlowGraphNodeToElementsProps = {
  node: PMNode;
};
export const convertFlowGraphNodeToElements = ({
  node,
}: ConvertFlowGraphNodeToElementsProps): FlowElements => {
  const elements: ElementAttributes = [];
  node.forEach((childNode: PMNode) => {
    let elementAttrs: any = {
      ...childNode.attrs,
    };

    if (childNode.type.name === 'flowTextElement') {
      elementAttrs = {
        ...elementAttrs,
        type: 'textElement',
      };
    }

    elements.push(elementAttrs);
  });

  return elements as FlowElements;
};
