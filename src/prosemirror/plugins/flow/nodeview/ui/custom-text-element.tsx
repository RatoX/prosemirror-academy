import React, { useContext, useCallback, useState } from 'react';
import { Handle, ElementId, Position } from 'react-flow-renderer';
import { Fragment, Node as PMNode, Schema } from 'prosemirror-model';
import { Decoration, EditorView, NodeView } from 'prosemirror-view';
import { NodeSelection } from 'prosemirror-state';
import { FlowEventsContext } from '../context';

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
  };
};
export const CustomTextElement: React.FC<CustomTextElementProps> = ({
  data,
  id,
}) => {
  const { blurEditorView, onElementDataChange, focusEditorView } = useContext(
    FlowEventsContext,
  );
  const [editMode, setEditMode] = useState(false);

  const onDoubleClick = useCallback(() => {
    setEditMode(true);
    blurEditorView();
  }, []);

  const handleInput = useCallback((evt: React.FormEvent<HTMLInputElement>) => {
    evt.stopPropagation();
    evt.preventDefault();
  }, []);

  const onInputKeyUp = useCallback(
    (evt: React.KeyboardEvent<HTMLInputElement>) => {
      evt.stopPropagation();
      evt.preventDefault();
      if (evt.key !== 'Enter') {
        return;
      }

      const { target } = evt;
      const newData = {
        label: (target as HTMLInputElement).value || 'NO TITLE',
      };
      onElementDataChange({ id, newData });
      setEditMode(false);
      focusEditorView();
    },
    [],
  );

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
