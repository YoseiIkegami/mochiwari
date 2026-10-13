import assert from "node:assert/strict";
import test from "node:test";

import { assignmentStatus, summarizeAssignments } from "../src/assignment.ts";

const members = ["あや", "たく", "みさき"];
const items = [
  { id: "1", name: "テント", owner: "あや", ready: true },
  { id: "2", name: "ランタン", owner: "あや", ready: false },
  { id: "3", name: "クーラー", owner: "たく", ready: true },
  { id: "4", name: "救急セット", owner: "", ready: false },
];

test("担当者ごとの件数と準備済み件数を集計する", () => {
  assert.deepEqual(summarizeAssignments(members, items), [
    { member: "あや", assigned: 2, ready: 1 },
    { member: "たく", assigned: 1, ready: 1 },
    { member: "みさき", assigned: 0, ready: 0 },
  ]);
});

test("未担当・準備済み・担当の偏りを返す", () => {
  assert.deepEqual(assignmentStatus(members, items), { assigned: 3, unassigned: 1, ready: 2, spread: 2 });
});

test("項目が空でも偏りは0", () => {
  assert.deepEqual(assignmentStatus(members, []), { assigned: 0, unassigned: 0, ready: 0, spread: 0 });
});
