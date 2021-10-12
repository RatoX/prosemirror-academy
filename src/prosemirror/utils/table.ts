import { Node as PMNode } from 'prosemirror-model';
import { Selection } from 'prosemirror-state';
import { findParentNodeOfSelection } from '.';
import { Coordinate } from '../../types';

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

type RangeProps = {
  startCell: Coordinate | null;
  endCell: Coordinate | null;
  selection: Selection;
};

const isOutOfRange = (coord: Coordinate, noOfColumns: number) => {
  const MIN_INDEX = 0;
  const MAX_INDEX = noOfColumns;
  const { rowIndex, columnIndex } = coord;
  if (
    rowIndex < MIN_INDEX ||
    rowIndex >= MAX_INDEX ||
    columnIndex < MIN_INDEX ||
    columnIndex >= MAX_INDEX
  ) {
    return true;
  }
  return false;
};

const getCellIndex = (coord: Coordinate, noOfColumns: number) =>
  coord.rowIndex * noOfColumns + coord.columnIndex;

type RangeReturn = {
  sum: number | string;
  isSameColumn: boolean;
  isSameRow: boolean;
};

export const getRangeSum = ({
  startCell,
  endCell,
  selection,
}: RangeProps): RangeReturn => {
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
  const noOfColumns = table?.node.attrs.columns || 1;
  const isSameColumn = startCell?.columnIndex === endCell?.columnIndex;
  const isSameRow = startCell?.rowIndex === endCell?.rowIndex;
  if (
    !startCell ||
    !endCell ||
    !table ||
    isOutOfRange(startCell, noOfColumns) ||
    isOutOfRange(endCell, noOfColumns)
  ) {
    return {
      sum: 'INVALID',
      isSameColumn: false,
      isSameRow: false,
    };
  }
  if (!isSameColumn && !isSameRow) {
    return getAreaSum({
      selection,
      startCell,
      endCell,
    });
  }
  const startCellIndex = getCellIndex(startCell, noOfColumns);
  const endCellIndex = getCellIndex(endCell, noOfColumns);
  const startPos = $from.posAtIndex(startCellIndex, table.depth);
  const endPos = $from.posAtIndex(endCellIndex + 1, table.depth);
  const isTableCell = (node: PMNode) => node.type === tableCellNodeType;
  const selectedNumberContent: number[] = [];
  const isInSelectedColumn = (index: number) =>
    index % noOfColumns === startCell.columnIndex;
  doc.nodesBetween(startPos, endPos, (node, _pos, _parent, index) => {
    if (isTableCell(node)) {
      if ((isSameColumn && isInSelectedColumn(index)) || isSameRow) {
        const tableCellContent = node.textContent;
        if (isNum(tableCellContent)) {
          selectedNumberContent.push(parseInt(tableCellContent));
        }
      }
    }
  });
  const sum = selectedNumberContent.reduce((a, b) => a + b, 0);
  return { sum, isSameRow, isSameColumn };
};

const alphaVal = (s: string): number => s.toLowerCase().charCodeAt(0) - 97;

export const mapStringToCoordinate = (input: string): any => {
  if (input.length !== 2 || !isNum(input[1])) {
    return null;
  }
  const columnIndex = alphaVal(input[0]);
  const rowIndex = parseInt(input[1]) - 1;

  return {
    columnIndex,
    rowIndex,
  };
};

type AreaProps = {
  selection: Selection;
  startCell: Coordinate | null;
  endCell: Coordinate | null;
};

export const getAreaSum = ({
  selection,
  startCell,
  endCell,
}: AreaProps): RangeReturn => {
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
  const noOfColumns = table?.node.attrs.columns || 1;
  const isStartBefore =
    startCell && endCell
      ? startCell.rowIndex <= endCell.rowIndex &&
        startCell.columnIndex <= endCell.columnIndex
      : false;
  if (
    !startCell ||
    !endCell ||
    !table ||
    !isStartBefore ||
    isOutOfRange(startCell, noOfColumns) ||
    isOutOfRange(endCell, noOfColumns)
  ) {
    return {
      sum: 'INVALID',
      isSameColumn: false,
      isSameRow: false,
    };
  }
  const maxColumnIndex = endCell.columnIndex;
  const startCellIndex = getCellIndex(startCell, noOfColumns);
  const endCellIndex = getCellIndex(endCell, noOfColumns);
  const startPos = $from.posAtIndex(startCellIndex, table.depth);
  const endPos = $from.posAtIndex(endCellIndex + 1, table.depth);
  const isTableCell = (node: PMNode) => node.type === tableCellNodeType;
  const selectedNumberContent: number[] = [];
  const isWithinMaxColIndex = (index: number) =>
    index % noOfColumns <= maxColumnIndex;
  doc.nodesBetween(startPos, endPos, (node, _pos, _parent, index) => {
    if (isTableCell(node) && isWithinMaxColIndex(index)) {
      const tableCellContent = node.textContent;
      if (isNum(tableCellContent)) {
        selectedNumberContent.push(parseInt(tableCellContent));
      }
    }
  });
  const sum = selectedNumberContent.reduce((a, b) => a + b, 0);
  return { sum, isSameRow: false, isSameColumn: false };
};
