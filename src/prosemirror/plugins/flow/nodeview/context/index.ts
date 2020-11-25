import { createContext } from 'react';
import {
  Elements as FlowElements,
  FlowElement,
  ElementId,
} from 'react-flow-renderer';

type FlowEventsContextProps = {
  onContentChange: (elements: FlowElements) => void;
  onElementDataChange: (props: { id: ElementId; newData: any }) => void;
  onElementSelect: (_: React.MouseEvent, element: FlowElement) => void;
  onFlowSelect: () => void;
  blurEditorView: () => void;
  focusEditorView: () => void;
};

const DummyEvents: FlowEventsContextProps = {
  onElementSelect: () => {},
  onContentChange: () => {},
  onElementDataChange: () => {},
  onFlowSelect: () => {},
  blurEditorView: () => {},
  focusEditorView: () => {},
};

export const FlowEventsContext = createContext<FlowEventsContextProps>(
  DummyEvents,
);
