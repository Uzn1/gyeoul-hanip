import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import { handleCommunity } from "../lib/api.mjs";
import { center, distance, filterPlaces, nearby, statusFor } from "../public/app/community.mjs";

test("한국 자정이 지나면 오늘 상태를 초기화하고 7일 뒤에 확인 필요로 표시한다", () => {
  const at = Date.parse("2026-11-24T23:50:00+09:00");
  const place = { latest: { at, status: "selling" }, confirmedAt: at };
  assert.equal(statusFor(place, at + 599_999).today.status, "selling");
  assert.equal(statusFor(place, at + 600_000).today, null);
  assert.equal(statusFor(place, at + 7 * 86_400_000 - 1).stale, false);
  assert.equal(statusFor(place, at + 7 * 86_400_000).stale, true);
});

test("지도와 목록에 줄 데이터에 동일한 필터와 거리 기준을 적용한다", () => {
  const now = Date.now();
  const places = [
    { id: 1, name: "시장 붕어빵", directions: "시장", categories: ["fish"], lat: center[0] + 0.001, lng: center[1], latest: { status: "selling", at: now } },
    { id: 2, name: "골목 호떡", directions: "골목", categories: ["pancake"], lat: center[0], lng: center[1], latest: { status: "sold_out", at: now } },
  ];
  const ids = result => result.map(place => place.id);
  assert.deepEqual(ids(filterPlaces(places, { query: "", todayOnly: false }, now, center)), [2, 1]);
  assert.deepEqual(ids(filterPlaces(places, { query: "", category: "fish", todayOnly: true }, now, center)), [1]);
  assert.deepEqual(ids(filterPlaces(places, { query: "호떡", todayOnly: true }, now, center)), []);
  assert.deepEqual(ids(nearby(places, center)), [2]);
  assert.equal(distance(center, center), 0);
});

function testD1() {
  const sqlite = new DatabaseSync(":memory:");
  const migration = new URL("../drizzle/0000_bitter_tag.sql", import.meta.url);
  sqlite.exec(readFileSync(migration, "utf8"));

  function prepare(query, values = []) {
    const statement = sqlite.prepare(query);
    return {
      bind: (...params) => prepare(query, params),
      async first() { return statement.get(...values) ?? null; },
      async all() { return { results: statement.all(...values) }; },
      async run() {
        const result = statement.run(...values);
        return { meta: { changes: result.changes, last_row_id: result.lastInsertRowid } };
      },
    };
  }

  return {
    prepare,
    async batch(statements) {
      sqlite.exec("BEGIN");
      try {
        const results = [];
        for (const statement of statements) results.push(await statement.run());
        sqlite.exec("COMMIT");
        return results;
      } catch (error) {
        sqlite.exec("ROLLBACK");
        throw error;
      }
    },
  };
}

test("공개 조회, 로그인 제보, 최신 기록, 신고와 병합을 실제 SQLite 쿼리로 검증한다", async () => {
  const db = testD1();
  const visitor = { id: "resident", admin: false };
  const admin = { id: "operator", admin: true };
  let now = Date.parse("2026-11-24T16:00:00+09:00");
  async function call(data, user, query = "", origin = "https://app.test") {
    const request = new Request(`https://app.test/api/community${query}`, data ? {
      method: "POST", headers: { "Content-Type": "application/json", Origin: origin }, body: JSON.stringify(data),
    } : {});
    return handleCommunity(request, db, user ?? null, now);
  }
  const sample = { action: "place", name: "시장 간식", directions: "입구 앞", categories: ["fish"], status: "selling", lat: center[0], lng: center[1] };

  assert.deepEqual((await (await call()).json()).places, []);
  assert.equal((await call(sample)).status, 401);
  assert.equal((await call(sample, visitor, "", "https://other.test")).status, 403);
  assert.equal((await call({ ...sample, categories: ["invalid"] }, visitor)).status, 400);
  const created = await call(sample, visitor);
  assert.equal(created.status, 201);
  const { id } = await created.json();
  assert.equal((await (await call()).json()).places[0].confirmedAt, now);

  now += 50;
  assert.equal((await call({ action: "visit", placeId: id, status: "sold_out" }, visitor)).status, 201);
  assert.equal((await (await call()).json()).places[0].latest.status, "sold_out");
  now += 50;
  await call({ action: "visit", placeId: id, status: "missing" }, visitor);
  const [place] = (await (await call()).json()).places;
  assert.equal(place.latest.status, "missing");
  assert.equal(place.confirmedAt, now - 50);

  const { id: duplicateId } = await (await call({ ...sample, name: "같은 판매처" }, visitor)).json();
  assert.equal((await call({ action: "flag", placeId: id, duplicateId, reason: "duplicate" }, visitor)).status, 201);
  assert.equal((await call(null, visitor, "?flags=1")).status, 403);
  assert.equal((await (await call(null, admin, "?flags=1")).json()).flags.length, 1);

  const merge = { action: "merge", placeId: id, targetId: duplicateId };
  assert.equal((await call(merge, visitor)).status, 403);
  assert.equal((await call(merge, admin)).status, 200);
  assert.equal((await call(merge, admin)).status, 409);
  assert.equal((await call({ action: "visit", placeId: id, status: "selling" }, visitor)).status, 409);
  assert.equal((await (await call()).json()).places.length, 1);
  const { visits } = await (await call(null, null, `?place=${duplicateId}`)).json();
  assert.deepEqual(visits.map(visit => visit.status), ["selling", "missing", "sold_out", "selling"]);
  assert.equal((await (await call(null, admin, "?flags=1")).json()).flags.length, 0);
});
