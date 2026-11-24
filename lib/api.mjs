import { cats, statuses, validPoint } from "../public/app/community.mjs";

const json = (data, status = 200) => Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
const error = (message, status) => json({ error: message }, status);
const validId = value => Number.isSafeInteger(value) && value > 0;
const shortText = (value, limit) => typeof value === "string" && value.trim().length <= limit ? value.trim() : "";
const has = (object, key) => typeof key === "string" && Object.hasOwn(object, key);

const activePlaces = `SELECT p.id, p.name, p.categories, p.lat, p.lng, p.directions,
  v.status, v.at, (SELECT MAX(at) FROM visits WHERE place_id=p.id AND status IN ('selling','sold_out')) AS confirmedAt
  FROM places p LEFT JOIN visits v ON v.id =
    (SELECT id FROM visits WHERE place_id=p.id ORDER BY at DESC,id DESC LIMIT 1)
  WHERE p.merged_into IS NULL ORDER BY p.id`;

function publicPlace({ categories, status, at, ...row }) {
  return { ...row, categories: JSON.parse(categories), latest: status ? { status, at } : null };
}

export async function handleCommunity(request, db, user, now = Date.now()) {
  if (!db) return error("판매처 데이터에 연결할 수 없어요.", 503);
  const url = new URL(request.url);
  try {
    if (request.method === "GET") {
      if (url.searchParams.has("place")) {
        const place = Number(url.searchParams.get("place"));
        if (!validId(place)) return error("판매처를 찾을 수 없어요.", 404);
        const row = await db.prepare("SELECT id FROM places WHERE id=? AND merged_into IS NULL").bind(place).first();
        if (!row) return error("판매처를 찾을 수 없어요.", 404);
        const { results } = await db.prepare("SELECT status, at FROM visits WHERE place_id=? ORDER BY at DESC,id DESC LIMIT 50").bind(place).all();
        return json({ visits: results });
      }

      if (url.searchParams.has("flags")) {
        if (!user?.admin) return error("운영자 권한이 필요해요.", 403);
        const { results } = await db.prepare(`SELECT f.id, f.place_id AS placeId, f.duplicate_id AS duplicateId,
          f.reason, f.notes, f.at, p.name FROM flags f JOIN places p ON p.id=f.place_id
          WHERE f.resolved_at IS NULL ORDER BY f.at DESC,f.id DESC`).all();
        return json({ flags: results });
      }

      const { results } = await db.prepare(activePlaces).all();
      return json({ places: results.map(publicPlace), now, viewer: user ? { admin: user.admin } : null });
    }

    if (request.method !== "POST") return error("지원하지 않는 요청이에요.", 405);
    if (!user) return error("제보하려면 로그인해 주세요.", 401);
    if (request.headers.get("Origin") !== url.origin ||
        !request.headers.get("Content-Type")?.startsWith("application/json")) {
      return error("이 페이지에서 다시 시도해 주세요.", 403);
    }
    let data;
    try {
      const raw = await request.text();
      if (raw.length > 4096) return error("입력 내용을 줄여 주세요.", 413);
      data = JSON.parse(raw);
    } catch {
      return error("입력 내용을 확인해 주세요.", 400);
    }
    if (!data || typeof data !== "object" || Array.isArray(data)) return error("입력 내용을 확인해 주세요.", 400);
    const { action, placeId, status } = data;

    if (action === "place") {
      const name = shortText(data.name, 42);
      const directions = shortText(data.directions, 140);
      const { lat, lng, categories } = data;
      if (!name || !directions || !validPoint(lat, lng) || !Array.isArray(categories) ||
          categories.length < 1 || categories.length > Object.keys(cats).length ||
          !categories.every(category => has(cats, category)) || !has(statuses, status)) {
        return error("위치, 이름, 간식 종류와 찾는 법을 확인해 주세요.", 400);
      }
      const [inserted] = await db.batch([
        db.prepare("INSERT INTO places(name,categories,lat,lng,directions,author_id,created_at) VALUES(?,?,?,?,?,?,?)")
          .bind(name, JSON.stringify([...new Set(categories)]), lat, lng, directions, user.id, now),
        db.prepare("INSERT INTO visits(place_id,author_id,status,at) VALUES(last_insert_rowid(),?,?,?)")
          .bind(user.id, status, now),
      ]);
      return json({ id: inserted.meta.last_row_id }, 201);
    }

    if (action === "visit" && validId(placeId) && has(statuses, status)) {
      const result = await db.prepare(`INSERT INTO visits(place_id,author_id,status,at)
        SELECT id,?,?,? FROM places WHERE id=? AND merged_into IS NULL`)
        .bind(user.id, status, now, placeId).run();
      return result.meta.changes ? json({ id: placeId }, 201) : error("판매처가 이동했어요. 지도를 새로 열어 주세요.", 409);
    }

    if (action === "flag" && validId(placeId) && ["wrong_pin", "duplicate"].includes(data.reason)) {
      const notes = shortText(data.notes ?? "", 280);
      const duplicateId = data.reason === "duplicate" ? data.duplicateId : null;
      if (data.reason === "duplicate" && (!validId(duplicateId) || duplicateId === placeId)) {
        return error("중복된 판매처를 골라 주세요.", 400);
      }
      if (typeof data.notes === "string" && data.notes.trim().length > 280) return error("설명은 280자까지 입력해 주세요.", 400);
      const result = await db.prepare(`INSERT INTO flags(place_id,duplicate_id,author_id,reason,notes,at)
        SELECT id,?,?,?,?,? FROM places WHERE id=? AND merged_into IS NULL
        AND (? IS NULL OR EXISTS(SELECT 1 FROM places WHERE id=? AND merged_into IS NULL))`)
        .bind(duplicateId, user.id, data.reason, notes, now, placeId, duplicateId, duplicateId).run();
      return result.meta.changes ? json({ id: placeId }, 201) : error("판매처가 이동했어요. 지도를 새로 열어 주세요.", 409);
    }

    if (action === "resolve" || action === "merge") {
      if (!user.admin) return error("운영자 권한이 필요해요.", 403);
      if (action === "resolve" && validId(data.flagId)) {
        const result = await db.prepare("UPDATE flags SET resolved_at=? WHERE id=? AND resolved_at IS NULL").bind(now, data.flagId).run();
        return result.meta.changes ? json({ ok: true }) : error("처리할 신고가 없어요.", 404);
      }
      if (action === "merge" && validId(placeId) && validId(data.targetId) && placeId !== data.targetId) {
        const targetId = data.targetId;
        const canMove = "EXISTS(SELECT 1 FROM places WHERE id=? AND merged_into=?)";
        const [merged] = await db.batch([
          db.prepare(`UPDATE places SET merged_into=? WHERE id=? AND merged_into IS NULL
            AND EXISTS(SELECT 1 FROM places WHERE id=? AND merged_into IS NULL)`).bind(targetId, placeId, targetId),
          db.prepare(`UPDATE visits SET place_id=? WHERE place_id=? AND ${canMove}`).bind(targetId, placeId, placeId, targetId),
          db.prepare(`UPDATE flags SET place_id=? WHERE place_id=? AND ${canMove}`).bind(targetId, placeId, placeId, targetId),
          db.prepare(`UPDATE flags SET duplicate_id=? WHERE duplicate_id=? AND ${canMove}`).bind(targetId, placeId, placeId, targetId),
          db.prepare("UPDATE flags SET resolved_at=? WHERE place_id=? AND duplicate_id=? AND resolved_at IS NULL")
            .bind(now, targetId, targetId),
        ]);
        return merged.meta.changes ? json({ id: targetId }) : error("이미 병합됐거나 판매처가 없어요.", 409);
      }
    }
    return error("입력 내용을 확인해 주세요.", 400);
  } catch (cause) {
    console.error("community request failed", cause);
    return error("저장소에 연결할 수 없어요. 잠시 뒤 다시 시도해 주세요.", 503);
  }
}
