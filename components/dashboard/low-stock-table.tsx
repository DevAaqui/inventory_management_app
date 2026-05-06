"use client";

import { Table } from "@heroui/react";

export type LowStockTableRow = {
  id: string;
  name: string;
  sku: string;
  quantityOnHand: number;
  displayThreshold: string;
};

export function LowStockTable({ rows }: { rows: LowStockTableRow[] }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <Table.ScrollContainer>
          <Table.Content
            aria-label="Low stock items"
            className="min-w-[28rem]"
          >
            <Table.Header>
              <Table.Column id="nameSku" isRowHeader>
                Name — SKU
              </Table.Column>
              <Table.Column className="tabular-nums" id="quantityOnHand">
                Quantity on hand
              </Table.Column>
              <Table.Column id="lowStockThreshold">
                Low stock threshold
              </Table.Column>
            </Table.Header>
            <Table.Body>
              {rows.map((row) => (
                <Table.Row id={row.id} key={row.id}>
                  <Table.Cell>
                    <span className="font-medium">{row.name}</span>
                    <span className="text-foreground/50 block text-xs">
                      {row.sku}
                    </span>
                  </Table.Cell>
                  <Table.Cell className="tabular-nums">
                    {row.quantityOnHand}
                  </Table.Cell>
                  <Table.Cell>{row.displayThreshold}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>
    </div>
  );
}
