import 'mocha';
import * as assert from 'assert';

import { DeltaInsertOp } from '../../src/DeltaInsertOp';
import { Grouper } from '../../src/grouper/Grouper';
import { TableGrouper } from '../../src/grouper/TableGrouper';
import {
  TableGroup,
  TableRow,
  TableCell,
  BlockGroup,
} from '../../src/grouper/group-types';

describe('TableGrouper', function () {
  describe('empty table', function () {
    var ops = [
      new DeltaInsertOp('\n', { table: 'row-1' }),
      new DeltaInsertOp('\n', { table: 'row-1' }),
      new DeltaInsertOp('\n', { table: 'row-1' }),
      new DeltaInsertOp('\n', { table: 'row-2' }),
      new DeltaInsertOp('\n', { table: 'row-2' }),
      new DeltaInsertOp('\n', { table: 'row-2' }),
      new DeltaInsertOp('\n', { table: 'row-3' }),
      new DeltaInsertOp('\n', { table: 'row-3' }),
      new DeltaInsertOp('\n', { table: 'row-3' }),
    ];

    it('should return table with 3 rows and 3 cells', function () {
      var groups = Grouper.pairOpsWithTheirBlock(ops);
      var tableGrouper = new TableGrouper();
      var act = tableGrouper.group(groups);
      var exp = [
        new TableGroup([
          new TableRow([
            new TableCell(<BlockGroup>groups[0]),
            new TableCell(<BlockGroup>groups[1]),
            new TableCell(<BlockGroup>groups[2]),
          ]),
          new TableRow([
            new TableCell(<BlockGroup>groups[3]),
            new TableCell(<BlockGroup>groups[4]),
            new TableCell(<BlockGroup>groups[5]),
          ]),
          new TableRow([
            new TableCell(<BlockGroup>groups[6]),
            new TableCell(<BlockGroup>groups[7]),
            new TableCell(<BlockGroup>groups[8]),
          ]),
        ]),
      ];

      assert.deepEqual(act, exp);
    });
  });

  describe('single 1 row table', function () {
    var ops = [
      new DeltaInsertOp('cell1'),
      new DeltaInsertOp('\n', { table: 'row-1' }),
      new DeltaInsertOp('cell2'),
      new DeltaInsertOp('\n', { table: 'row-1' }),
    ];

    it('should return table with 1 row', function () {
      var groups = Grouper.pairOpsWithTheirBlock(ops);
      var tableGrouper = new TableGrouper();
      var act = tableGrouper.group(groups);
      var exp = [
        new TableGroup([
          new TableRow([
            new TableCell(<BlockGroup>groups[0]),
            new TableCell(<BlockGroup>groups[1]),
          ]),
        ]),
      ];

      assert.deepEqual(act, exp);
    });
  });

  describe('single 1 col table', function () {
    var ops = [
      new DeltaInsertOp('cell1'),
      new DeltaInsertOp('\n', { table: 'row-1' }),
      new DeltaInsertOp('cell2'),
      new DeltaInsertOp('\n', { table: 'row-2' }),
    ];

    it('should return table with 1 col', function () {
      var groups = Grouper.pairOpsWithTheirBlock(ops);
      var tableGrouper = new TableGrouper();
      var act = tableGrouper.group(groups);
      var exp = [
        new TableGroup([
          new TableRow([new TableCell(<BlockGroup>groups[0])]),
          new TableRow([new TableCell(<BlockGroup>groups[1])]),
        ]),
      ];

      assert.deepEqual(act, exp);
    });
  });
});
