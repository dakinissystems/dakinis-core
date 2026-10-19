import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  dakinisFiscalComputeRecordHash,
  dakinisFiscalVerifyRecordHash
} from "../src/modules/fiscal/hash-chain.js";

describe("fiscal hash chain", () => {
  it("is deterministic and chains previous hash", () => {
    const record = {
      businessId: "biz_1",
      series: "A",
      number: 1,
      invoiceNumber: "A-2026-00001",
      totalAmount: 12.1
    };
    const h1 = dakinisFiscalComputeRecordHash(record, "");
    const h1b = dakinisFiscalComputeRecordHash(record, "");
    assert.equal(h1, h1b);
    assert.equal(h1.length, 64);

    const h2 = dakinisFiscalComputeRecordHash({ ...record, number: 2 }, h1);
    assert.notEqual(h2, h1);
    assert.equal(dakinisFiscalVerifyRecordHash({ ...record, number: 2 }, h1, h2), true);
  });
});
