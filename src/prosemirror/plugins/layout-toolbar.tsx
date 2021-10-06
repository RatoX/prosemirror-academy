import React, { useMemo, useCallback } from 'react';
import { EditorState, Transaction } from 'prosemirror-state';
import TrashIcon from '@atlaskit/icon/glyph/trash';
import Button from '@atlaskit/button/standard-button';
import Lozenge from '@atlaskit/lozenge';
import {
  findLayoutNumberSectionParent,
  findLayoutParent,
  findLayoutSections,
  NodePositions,
  isLayoutNumberSection,
} from './layout-utils';

type Props = {
  editorState: EditorState;
  dispatch: (tr: Transaction) => void;
};
export const Toolbar: React.FC<Props> = ({ editorState, dispatch }) => {
  const sections = findLayoutSections(editorState.selection);
  let numberSectionAmount = 0;
  let textSectionAmount = 0;

  sections.forEach(({ node }: NodePositions) => {
    if (isLayoutNumberSection(node)) {
      numberSectionAmount++;
    } else {
      textSectionAmount++;
    }
  });

  const hasOnlyNumbers = sections.length === numberSectionAmount;
  const hasOnlyText = sections.length === textSectionAmount;
  const hasMixedContent = !hasOnlyNumbers && !hasOnlyText;

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

  return (
    <div className="toolbar">
      {hasMixedContent && (
        <Lozenge appearance="moved" isBold>
          Mixed
        </Lozenge>
      )}
      {hasOnlyNumbers && (
        <Lozenge appearance="inprogress" isBold>
          Number
        </Lozenge>
      )}
      {hasOnlyText && (
        <Lozenge appearance="new" isBold>
          Text
        </Lozenge>
      )}
      <div className="toolbar__separator" />
      <Button
        isDisabled={hasMixedContent}
        appearance="subtle"
        spacing="compact"
        css=""
      >
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
