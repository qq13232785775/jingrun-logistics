declare module "node:sqlite" {
  export type SqlValue = string | number | bigint | null | Uint8Array;

  export interface StatementResult {
    changes: number | bigint;
    lastInsertRowid: number | bigint;
  }

  export interface StatementSync {
    get(...params: SqlValue[]): unknown;
    all(...params: SqlValue[]): unknown[];
    run(...params: SqlValue[]): StatementResult;
  }

  export class DatabaseSync {
    constructor(path: string);
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
    close(): void;
  }
}
