import { Node as PMNode } from 'prosemirror-model';
import { Selection } from 'prosemirror-state';
import { findParentNodeOfSelection } from '.';

const isNum = (val: string) => /^\d+$/.test(val);

type Props = {
  selection: Selection;
};
export const printRowAndColSum = ({ selection }: Props): void => {
  const { $from } = selection;
  const doc = $from.doc;
  const {
    type: {
      schema: {
        nodes: { table: tableNodeType, tableCell: tableCellNodeType },
      },
    },
  } = doc;
  const table = findParentNodeOfSelection(selection, tableNodeType);
  if (!table) {
    return;
  }

  const tableCellIndex = $from.index(table.depth);
  const noOfCols = table.node.attrs.columns || 1; // safe check
  const rowIndex = Math.trunc(tableCellIndex / noOfCols);
  const colIndex = tableCellIndex % noOfCols;
  const startRowPos = $from.posAtIndex(rowIndex * noOfCols, table.depth);
  const endRowPos = $from.posAtIndex(
    rowIndex * noOfCols + noOfCols,
    table.depth,
  );
  const isTableCell = (node: PMNode) => node.type === tableCellNodeType;
  const selectedRowNumberContent: number[] = [];
  doc.nodesBetween(startRowPos, endRowPos, node => {
    if (isTableCell(node)) {
      const tableCellContent = node.textContent;
      if (isNum(tableCellContent)) {
        selectedRowNumberContent.push(parseInt(tableCellContent));
      }
    }
  });
  const lastColumnCellIndex = noOfCols * (noOfCols - 1) + colIndex;
  const startColPos = $from.posAtIndex(colIndex, table.depth);
  const endColPos = $from.posAtIndex(lastColumnCellIndex + 1, table.depth);
  const selectedColumnNumberContent: number[] = [];
  const isInSelectedColumn = (index: number) => index % noOfCols === colIndex;
  doc.nodesBetween(startColPos, endColPos, (node, _pos, _parent, index) => {
    if (isTableCell(node) && isInSelectedColumn(index)) {
      const tableCellContent = node.textContent;
      if (isNum(tableCellContent)) {
        selectedColumnNumberContent.push(parseInt(tableCellContent));
      }
    }
  });
  const colSum = selectedColumnNumberContent.reduce((a, b) => a + b, 0);
  const rowSum = selectedRowNumberContent.reduce((a, b) => a + b, 0);
  console.log({ colSum, rowSum });
};
