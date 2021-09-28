import React, { useMemo, useCallback } from 'react';
import { EditorState, Transaction } from 'prosemirror-state';
import TrashIcon from '@atlaskit/icon/glyph/trash';
import Button from '@atlaskit/button/standard-button';
import Lozenge from '@atlaskit/lozenge';
import {
  findLayoutNumberSectionParent,
  findLayoutParent,
} from './layout-utils';

type Props = {
  editorState: EditorState;
  dispatch: (tr: Transaction) => void;
};
export const Toolbar: React.FC<Props> = ({ editorState, dispatch }) => {
  const onTrashClick = useCallback(() => {
    const layoutNodePositions = findLayoutParent(editorState.selection);
    if (!layoutNodePositions) {
      return;
    }

    const { tr } = editorState;

    tr.delete(
      layoutNodePositions.wrappingPositions.startPos,
      layoutNodePositions.wrappingPositions.endPos,
    );

    dispatch(tr);
  }, [editorState, dispatch]);
  const isLayoutNumber = useMemo(() => {
    return Boolean(findLayoutNumberSectionParent(editorState.selection));
  }, [editorState.selection]);

  return (
    <div className="toolbar">
      {isLayoutNumber ? (
        <Lozenge appearance="inprogress" isBold>
          Number
        </Lozenge>
      ) : (
        <Lozenge appearance="new" isBold>
          Text
        </Lozenge>
      )}
      <div className="toolbar__separator" />
      <Button appearance="subtle" spacing="compact" css="">
        Change type
      </Button>
      <div className="toolbar__separator" />
      <Button
        onClick={onTrashClick}
        appearance="subtle"
        spacing="compact"
        css=""
      >
        <TrashIcon label="delete" size="small" />
      </Button>
    </div>
  );
};
