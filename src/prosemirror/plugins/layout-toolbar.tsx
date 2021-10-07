import React, { useMemo, useCallback, useState } from 'react';
import { EditorView } from 'prosemirror-view';
import { Node as PMNode } from 'prosemirror-model';
import TrashIcon from '@atlaskit/icon/glyph/trash';
import Button from '@atlaskit/button/standard-button';
import Lozenge from '@atlaskit/lozenge';
import { LayoutChangeTemplates } from './layout-change-templates';
import type { NextTemplateType } from './layout-change-templates';
import {
  findLayoutNumberSectionParent,
  findLayoutParent,
  findLayoutSections,
  NodePositions,
  isLayoutNumberSection,
} from './layout-utils';

type Props = {
  editorView: EditorView;
};
export const Toolbar: React.FC<Props> = ({ editorView }) => {
  const sections = findLayoutSections(editorView.state.selection);
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
    const { state: editorState, dispatch } = editorView;
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
  }, [editorView]);

  const onRemoveTemplate = useCallback(() => {
    const { state: editorState, dispatch } = editorView;
    const layoutPosition = findLayoutParent(editorState.selection);

    if (!layoutPosition) {
      return;
    }

    const { tr } = editorState;

    const nextLayoutAttributes = {
      ...layoutPosition.node.attrs,
      template: 'not-set',
    };
    tr.setNodeMarkup(
      layoutPosition.wrappingPositions.startPos,
      undefined,
      nextLayoutAttributes,
    );

    dispatch(tr);
  }, [editorView]);
  const onApplyTemplate = useCallback(
    ({ nextTemplate, sectionsOrder }: NextTemplateType) => {
      const { state: editorState, dispatch } = editorView;
      const layoutPosition = findLayoutParent(editorState.selection);

      if (!layoutPosition) {
        return;
      }

      const { tr } = editorState;

      const nextLayoutAttributes = {
        ...layoutPosition.node.attrs,
        template: nextTemplate,
      };
      tr.setNodeMarkup(
        layoutPosition.wrappingPositions.startPos,
        undefined,
        nextLayoutAttributes,
      );

      type OriginalSectionPositionType = {
        wrappingPositions: {
          startPos: number;
          endPos: number;
        };
        node: PMNode;
      };
      const originalSections: Array<OriginalSectionPositionType> = [];

      layoutPosition.node.descendants((node, position) => {
        const startPos = position + layoutPosition.innerPositions.startPos;
        const endPos = startPos + node.nodeSize;

        originalSections.push({
          wrappingPositions: {
            startPos,
            endPos,
          },
          node,
        });

        return false;
      });

      for (let i = sectionsOrder.length - 1; i >= 0; i--) {
        const originalSectionIndexToInsert = sectionsOrder[i];

        const sectionToReplace = originalSections[i];
        const sectionToInsert = originalSections[originalSectionIndexToInsert];

        tr.replaceRangeWith(
          sectionToReplace.wrappingPositions.startPos,
          sectionToReplace.wrappingPositions.endPos,
          sectionToInsert.node,
        );
      }

      dispatch(tr);
    },
    [editorView],
  );

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
      <LayoutChangeTemplates
        onApply={onApplyTemplate}
        onRemove={onRemoveTemplate}
      />
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
