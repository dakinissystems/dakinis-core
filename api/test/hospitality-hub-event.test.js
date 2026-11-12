import test from "node:test";
import assert from "node:assert/strict";
import { dakinisHospitalityHubEventRequest } from "../src/modules/hospitality/hub-timeline-bridge.js";

test("sin JWT no hay evento de Hub", () => {
  assert.equal(dakinisHospitalityHubEventRequest("sale.completed", { amount: 12 }, ""), null);
});

test("el evento lleva el JWT y no nombra a una persona", () => {
  const request = dakinisHospitalityHubEventRequest(
    "sale.completed",
    {
      amount: 12,
      workspaceSlug: "heladeria-copernico",
      userId: "person",
      platformUserId: "person",
      user_id: "person",
      tenantId: "tenant",
      businessId: "biz",
    },
    "aaa.bbb.ccc"
  );
  assert.equal(request.headers["X-Dakinis-Actor"], "aaa.bbb.ccc");
  assert.equal(request.body.userId, undefined);
  assert.equal(request.body.tenantId, undefined);
  assert.equal(request.body.payload.userId, undefined);
  assert.equal(request.body.payload.platformUserId, undefined);
  assert.equal(request.body.payload.user_id, undefined);
  assert.equal(request.body.payload.tenantId, undefined);
  assert.equal(request.body.payload.businessId, undefined);
  assert.equal(request.body.payload.workspaceSlug, "heladeria-copernico");
  assert.equal(request.body.payload.amount, 12);
});
