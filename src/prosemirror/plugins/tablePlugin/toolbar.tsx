import React, { useCallback, useMemo, useState } from 'react';
import Button from '@atlaskit/button';
import { EditorState } from 'prosemirror-state';
import { EditorDispatch } from '../../../types';
import { getRangeSum, mapStringToCoordinate } from '../../utils';
import { tablePluginKey } from './table';

type Props = {
  editorState: EditorState;
  dispatch: EditorDispatch;
  startCoordProp: string;
  endCoordProp: string;
};

export const Toolbar: React.FC<Props> = ({
  editorState,
  dispatch,
  startCoordProp,
  endCoordProp,
}) => {
  const { tr } = editorState;
  const [startCoord, setStartCoord] = useState<string>(startCoordProp);
  const [endCoord, setEndCoord] = useState<string>(endCoordProp);
  const handleInputChange = useCallback(
    (event: any) => {
      const { name, value } = event.target;
      if (name === 'startCoord') {
        setStartCoord(value);
      } else if (name === 'endCoord') {
        setEndCoord(value);
      }
      tr.setMeta(tablePluginKey, {
        action: 'RANGE_SUM_UPDATE',
        value,
        name,
      });
      if (dispatch) {
        dispatch(tr);
      }
    },
    [startCoord, endCoord],
  );

  const sum = useMemo(() => {
    const startCell = mapStringToCoordinate(startCoord);
    const endCell = mapStringToCoordinate(endCoord);

    const { sum, isSameColumn, isSameRow } = getRangeSum({
      startCell,
      endCell,
      selection: tr.selection,
    });
    const SUM_TYPE =
      sum !== 'INVALID'
        ? isSameRow
          ? 'ROW SUM: '
          : isSameColumn
          ? 'COLUMN SUM: '
          : 'AREA SUM: '
        : '';
    return `${SUM_TYPE}${sum}`;
  }, [startCoord, endCoord]);

  return (
    <div className="toolbar">
      <input
        onChange={handleInputChange}
        name="startCoord"
        placeholder="Enter start cell e.g. A1"
        className="toolbar--field"
        value={startCoord}
      />{' '}
      <Button appearance="subtle" spacing="compact" css="">
        :
      </Button>
      <input
        onChange={handleInputChange}
        name="endCoord"
        placeholder="Enter end cell e.g. A3"
        className="toolbar--field"
        value={endCoord}
      />
      <Button appearance="subtle" spacing="compact" css="">
        =
      </Button>
      <Button appearance="subtle" style={{ fontWeight: 'bold' }} css="">
        {sum}
      </Button>
    </div>
  );
};
