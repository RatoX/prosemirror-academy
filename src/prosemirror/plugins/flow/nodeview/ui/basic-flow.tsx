import React, { useContext, useCallback, useState } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  BackgroundVariant,
  Connection,
  Edge,
  Elements as FlowElements,
  FlowElement,
  OnLoadParams,
  ReactFlowProvider,
} from 'react-flow-renderer';
import { CustomTextElement } from './custom-text-element';
import { FlowEventsContext } from '../context';

const nodeTypes = {
  textElement: CustomTextElement,
};

type BasicFlowProps = {
  elements: FlowElements;
};
export const BasicFlow: React.FC<BasicFlowProps> = ({ elements }) => {
  const { onElementSelect, onContentChange, onFlowSelect } = useContext(
    FlowEventsContext,
  );
  const [instance, setInstance] = useState<OnLoadParams>();
  const onNodeDragStop = useCallback(() => {
    if (!instance) {
      return;
    }

    onContentChange(instance.toObject().elements);
  }, [instance]);
  const onConnect = useCallback(
    (edges: Edge | Connection) => {
      const nextElements = addEdge(edges, elements);
      onContentChange(nextElements);
    },
    [elements],
  );
  const onLoad = useCallback((instance: OnLoadParams) => {
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
        onPaneClick={onFlowSelect}
        nodeTypes={nodeTypes}
        onElementClick={onElementSelect}
        onNodeDragStop={onNodeDragStop}
        onConnect={onConnect}
      >
        <Background variant={BackgroundVariant.Lines} />
      </ReactFlow>
    </ReactFlowProvider>
  );
};
