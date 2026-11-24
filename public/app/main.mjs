import { cats, center, examples, filterPlaces, nearby, statusFor, statuses, validPoint, visitLabel } from "./community.mjs";
import { createMap } from "./map.mjs";

const byId = id => document.getElementById(id);
const panel = byId("panel"), panelBody = byId("panel-body"), list = byId("list");
const categoryBar = byId("categories"), mapElement = byId("map");
const params = new URLSearchParams(location.search);
const api = new URL("/api/community", location.origin);
const state = {
  places: [], now: Date.now(), offset: 0, viewer: null, loaded: false, failed: false,
  category: "", todayOnly: false, query: "", origin: center, pickedId: null, picking: false, point: null, draft: null,
};
const map = createMap(mapElement, point => { if (state.picking) choosePoint(point); }, id => {
  if (state.picking) {
    const place = allPlaces().find(item => item.id === id);
    if (place) choosePoint([place.lat, place.lng]);
  } else {
    showPlace(id);
  }
});
const esc = value => String(value ?? "").replace(/[&<>"']/g, character =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
const allPlaces = () => state.loaded && !state.places.length ? examples(state.now) : state.places;
const meters = value => value < 1000 ? `${Math.round(value)} m` : `${(value / 1000).toFixed(1)} km`;
let toastTimer;

function notice(message) {
  const toast = byId("toast");
  toast.hidden = false;
  toast.textContent = message;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 4500);
}

function snack(key) {
  return `<span class="snack snack-${key}" aria-hidden="true">${cats[key].emoji}</span>`;
}

function statusMarkup(place) {
  const { today, stale } = statusFor(place, state.now);
  const tone = today ? today.status : "unconfirmed";
  const label = today
    ? `${visitLabel(today.at, state.now)} ${today.status === "selling" ? "판매 확인" : statuses[today.status]}`
    : "오늘 확인 없음";
  return `<span class="status ${tone}"><i></i>${label}</span>${stale ? '<span class="stale">최근 확인 필요</span>' : ''}`;
}

function render() {
  state.now = Date.now() + state.offset;
  const current = filterPlaces(allPlaces(), state, state.now, state.origin);
  byId("count").textContent = state.loaded ? `${current.length}곳` : "";
  byId("example-note").hidden = !state.loaded || !!state.places.length;
  byId("map-error").hidden = !state.failed;
  if (state.failed) byId("map-error").textContent = "판매처를 불러오지 못했어요. 잠시 뒤 다시 시도해 주세요.";
  byId("admin").hidden = !state.viewer?.admin;
  const signin = byId("signin");
  signin.textContent = state.viewer ? "로그아웃" : "로그인";
  signin.href = state.viewer ? "/signout-with-chatgpt?return_to=%2Fmap.html" : "/signin-with-chatgpt?return_to=%2Fmap.html";
  list.setAttribute("aria-busy", String(!state.loaded && !state.failed));
  if (!state.loaded) {
    list.innerHTML = state.failed ? '<div class="empty"><button class="button secondary" data-action="retry">다시 불러오기</button></div>' : '<p class="empty">판매처를 불러오는 중이에요.</p>';
  } else if (!current.length) {
    list.innerHTML = `<div class="empty"><span aria-hidden="true">❄</span><h3>표시할 판매처가 없어요</h3><button class="button secondary" data-action="start">이 동네에 첫 판매처 제보하기</button></div>`;
  } else {
    list.innerHTML = current.map(place => `<button type="button" class="place-row" data-place="${place.id}" aria-label="${esc(place.name)}${place.example ? ' 예시' : ''} 상세 보기">
      ${snack(place.categories[0])}<span class="place-copy"><span class="place-kinds">${place.categories.map(key => cats[key].name).join(" · ")}${place.example ? " · 예시" : ""}</span>
      <strong>${esc(place.name)}</strong><span class="place-meta">${statusMarkup(place)}</span></span><span class="distance">${meters(place.meters)}</span></button>`).join("");
    if (!state.places.length) list.insertAdjacentHTML("beforeend", '<div class="first-report"><button class="button secondary" data-action="start">이 동네에 첫 판매처 제보하기</button></div>');
  }
  map.draw(current, state.pickedId);
}

async function request({ data, query } = {}) {
  const target = new URL(api);
  if (query) target.search = new URLSearchParams(query);
  const options = data ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) } : {};
  let response;
  try { response = await fetch(target, options); }
  catch { throw new Error("연결을 확인하고 다시 시도해 주세요."); }
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error ?? "잠시 뒤 다시 시도해 주세요.");
  return result;
}

async function load() {
  try {
    const data = await request();
    Object.assign(state, { places: data.places, viewer: data.viewer, offset: data.now - Date.now(), loaded: true, failed: false });
  } catch {
    state.failed = true;
  }
  render();
}

function openPanel(html) {
  panelBody.innerHTML = html;
  if (!panel.open) panel.showModal();
}

function loginPanel(returnTo) {
  openPanel(`<p class="panel-kicker">주민 제보</p><h2 id="panel-title">로그인하고 제보하기</h2>
    <p>로그인하면 발견한 판매처와 방문 결과를 이웃과 나눌 수 있어요.</p>
    <a class="button primary wide" href="/signin-with-chatgpt?return_to=${encodeURIComponent(returnTo)}" target="_top">ChatGPT로 계속하기</a>`);
}

async function showPlace(id) {
  const place = allPlaces().find(item => item.id === Number(id));
  if (!place) return notice("판매처를 찾을 수 없어요.");
  state.pickedId = place.id;
  render();
  openPanel(`<div class="detail-head">${snack(place.categories[0])}<div><p class="panel-kicker">${place.categories.map(key => cats[key].name).join(" · ")}${place.example ? ' · 예시' : ''}</p>
    <h2 id="panel-title">${esc(place.name)}</h2></div></div>
  <p class="detail-status" id="detail-status">${statusMarkup(place)}</p>
    <section class="detail-block"><h3>찾는 법</h3><p>${esc(place.directions)}</p><p class="coordinates">지도 위치 ${place.lat.toFixed(5)}, ${place.lng.toFixed(5)}</p></section>
    ${place.example ? '<p class="sample-warning">예시 판매처예요. 실제 판매 정보는 주민 제보로 채워져요.</p><button class="button primary wide" data-action="start">실제 판매처 제보하기</button>'
    : `<section class="detail-block"><h3>지나가다 확인하셨나요?</h3><div class="report-buttons">${Object.entries(statuses).map(([key, label]) =>
      `<button class="button secondary ${key}" data-visit="${key}">${label}</button>`).join("")}</div></section>
      <section class="detail-block"><h3>최근 방문 기록</h3><div id="history" aria-busy="true">불러오는 중이에요.</div></section>
      <button class="text-button" data-action="flag">잘못된 핀 또는 중복 신고</button>`}`);
  if (place.example) return;
  const history = byId("history");
  try {
    const { visits } = await request({ query: { place: place.id } });
    history.innerHTML = visits.length ? `<ul>${visits.map(visit =>
      `<li><span>${statuses[visit.status]}</span><time datetime="${new Date(visit.at).toISOString()}">${visitLabel(visit.at, state.now)}</time></li>`).join("")}</ul>`
      : "아직 방문 기록이 없어요.";
  } catch (error) { history.textContent = error.message; }
  history.setAttribute("aria-busy", "false");
}

function startReport() {
  if (!state.loaded) { notice("판매처를 불러온 뒤 다시 시도해 주세요."); return; }
  if (!state.viewer) { loginPanel("/map.html?action=new"); return; }
  panel.close();
  state.draft = null;
  selectPoint();
}

function selectPoint() {
  if (panel.open) panel.close();
  state.picking = true;
  byId("pick-help").hidden = false;
  mapElement.classList.add("picking");
  mapElement.focus({ preventScroll: true });
  mapElement.scrollIntoView({ block: "nearest" });
}

function stopPicking(clear = true) {
  state.picking = false;
  byId("pick-help").hidden = true;
  mapElement.classList.remove("picking");
  if (clear) {
    state.point = null;
    map.draft(null);
  }
}

function choosePoint(point) {
  if (!validPoint(...point)) { notice("망원동 시범 지역 안에 핀을 찍어 주세요."); return; }
  stopPicking(false);
  state.point = point;
  map.draft(point);
  const candidates = nearby(state.places, point);
  openPanel(`<p class="panel-kicker">주민 제보</p><h2 id="panel-title">새 판매처 제보</h2>
    <div class="selected-position"><span>⌖ 망원동 · 위치 지정 완료</span><button class="text-button" data-action="repick">위치 다시 찍기</button></div>
    ${candidates.length ? `<section class="candidates"><h3>근처에 등록된 판매처가 있어요</h3><p>같은 곳이면 방문 상태를 제보할 수 있어요.</p>
      ${candidates.map(place => `<button type="button" class="candidate" data-candidate="${place.id}"><strong>${esc(place.name)}</strong><span>기존 제보 보기 · ${meters(place.meters)}</span></button>`).join("")}</section>` : ""}
    <form id="place-form">
      <label class="field">판매처 이름<input name="name" required maxlength="42" placeholder="예. 시장 입구 붕어빵" value="${esc(state.draft?.name)}"></label>
      <fieldset><legend>간식 종류 <small>여러 개 선택 가능</small></legend><div class="form-chips">${Object.entries(cats).map(([key, cat]) =>
        `<label><input type="checkbox" name="categories" value="${key}" ${state.draft?.categories.includes(key) ? 'checked' : ''}><span>${cat.emoji} ${cat.name}</span></label>`).join("")}</div></fieldset>
      <label class="field">찾는 법<textarea name="directions" required maxlength="140" rows="2" placeholder="예. 약국 앞, 시장 입구 맞은편">${esc(state.draft?.directions)}</textarea></label>
      <label class="field">방문 상태<select name="status">${Object.entries(statuses).map(([key, label]) =>
        `<option value="${key}" ${state.draft?.status === key ? 'selected' : ''}>${label}</option>`).join("")}</select></label>
      <p class="form-error" role="alert" hidden></p><button class="button primary wide" type="submit">판매처 등록하기</button>
    </form>`);
}

function draftFrom(form) {
  const data = new FormData(form);
  return { name: data.get("name"), directions: data.get("directions"), categories: data.getAll("categories"), status: data.get("status") };
}

function showFlag() {
  const place = state.places.find(item => item.id === state.pickedId);
  if (!place) return;
  if (!state.viewer) return loginPanel(`/map.html?place=${place.id}&action=flag`);
  const options = state.places.filter(item => item.id !== place.id).map(item =>
    `<option value="${item.id}">${esc(item.name)}</option>`).join("");
  openPanel(`<p class="panel-kicker">${esc(place.name)}</p><h2 id="panel-title">판매처 신고</h2><form id="flag-form">
    <label class="field">신고 이유<select id="flag-reason" name="reason"><option value="wrong_pin">위치가 잘못됐어요</option>
    ${options ? '<option value="duplicate">중복 판매처예요</option>' : ''}</select></label>
    <label class="field" id="duplicate-field" hidden>같은 판매처<select name="duplicate"><option value="">판매처 선택</option>${options}</select></label>
    <label class="field">자세한 설명<textarea name="notes" maxlength="280" rows="3"></textarea></label>
    <p class="form-error" role="alert" hidden></p><button class="button primary wide" type="submit">신고 보내기</button></form>`);
}

async function showAdmin() {
  openPanel('<h2 id="panel-title">신고 관리</h2><p>불러오는 중이에요.</p>');
  try {
    const { flags } = await request({ query: { flags: 1 } });
    if (!panel.open || byId("panel-title")?.textContent !== "신고 관리") return;
    openPanel(`<h2 id="panel-title">신고 관리</h2>${flags.length ? flags.map(flag => {
      const target = state.places.find(place => place.id === flag.duplicateId);
      return `<article class="admin-report"><h3>${esc(flag.name)}</h3><p>${flag.reason === "duplicate" ? "중복 판매처" : "잘못된 핀"} · ${visitLabel(flag.at, state.now)}</p>
        ${flag.notes ? `<p>${esc(flag.notes)}</p>` : ""}${target ? `<p>병합 후 유지할 위치 <strong>${esc(target.name)}</strong></p>
        <button class="button primary" data-merge="${flag.placeId}" data-target="${target.id}">중복 핀 병합</button>` : ""}
        <button class="button secondary" data-resolve="${flag.id}">처리 완료</button></article>`;
    }).join("") : '<p>처리할 신고가 없어요.</p>'}`);
  } catch (error) { if (panel.open) notice(error.message); }
}

async function mutate(button, data, after, form) {
  button.disabled = true;
  try { await after(await request({ data })); }
  catch (error) {
    const feedback = form?.querySelector(".form-error");
    if (feedback) { feedback.textContent = error.message; feedback.hidden = false; }
    else notice(error.message);
  } finally { button.disabled = false; }
}

categoryBar.innerHTML = `<button type="button" class="chip" data-category="" aria-pressed="true">전체</button>${Object.entries(cats)
  .map(([key, cat]) => `<button type="button" class="chip" data-category="${key}" aria-pressed="false"><span aria-hidden="true">${cat.emoji}</span>${cat.name}</button>`).join("")}`;

categoryBar.addEventListener("click", event => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  categoryBar.querySelector('[aria-pressed="true"]').setAttribute("aria-pressed", "false");
  button.setAttribute("aria-pressed", "true");
  state.category = button.dataset.category;
  render();
});
byId("today").addEventListener("change", event => { state.todayOnly = event.target.checked; render(); });
byId("search").addEventListener("input", event => { state.query = event.target.value; render(); });
byId("zoom-in").onclick = () => map.zoom(0.6);
byId("zoom-out").onclick = () => map.zoom(-0.6);
byId("pick-center").onclick = () => choosePoint(map.center());
byId("cancel-pick").onclick = () => { stopPicking(); state.draft = null; };
byId("admin").onclick = showAdmin;
byId("close-panel").onclick = () => panel.close();
panel.addEventListener("click", event => { if (event.target === panel) panel.close(); });
panel.addEventListener("close", () => {
  if (!state.picking) {
    state.pickedId = null;
    state.point = null;
    map.draft(null);
    render();
  }
});

byId("locate").onclick = () => {
  if (!navigator.geolocation) { notice("이 브라우저에서 위치를 사용할 수 없어요."); return; }
  const button = byId("locate");
  button.disabled = true;
  navigator.geolocation.getCurrentPosition(({ coords }) => {
    state.origin = [coords.latitude, coords.longitude];
    map.locate(state.origin);
    byId("origin").textContent = "내 위치 기준";
    button.disabled = false;
    render();
  }, () => {
    button.disabled = false;
    notice("현재 위치를 확인할 수 없어요. 망원동 중심에서 둘러보세요.");
  }, { timeout: 8000, maximumAge: 60000 });
};

document.addEventListener("click", event => {
  const button = event.target.closest("button");
  if (!button) return;
  const data = button.dataset;
  if (data.action === "start") startReport();
  if (data.action === "retry") load();
  if (data.action === "flag") showFlag();
  if (data.action === "repick") {
    state.draft = draftFrom(byId("place-form"));
    selectPoint();
  }
  if (data.place) showPlace(data.place);
  if (data.candidate) { state.point = null; map.draft(null); showPlace(data.candidate); }
  if (data.visit) {
    const id = state.pickedId;
    if (!state.viewer) { loginPanel(`/map.html?place=${id}`); return; }
    mutate(button, { action: "visit", placeId: id, status: data.visit }, async () => {
      await load();
      if (panel.open && state.pickedId === id) await showPlace(id);
      notice("방문 제보를 저장했어요.");
    });
  }
  if (data.merge) {
    const { merge, target } = data;
    openPanel(`<h2 id="panel-title">중복 핀 병합</h2><p>두 판매처의 방문 기록을 선택한 대표 핀에 모아요.</p>
      <button class="button primary" data-confirm-merge="${merge}" data-target="${target}">병합하기</button>
      <button class="button secondary" data-action="back-admin">취소</button>`);
  }
  if (data.action === "back-admin") showAdmin();
  if (data.confirmMerge || data.resolve) {
    const operation = data.confirmMerge
      ? { action: "merge", placeId: Number(data.confirmMerge), targetId: Number(data.target) }
      : { action: "resolve", flagId: Number(data.resolve) };
    mutate(button, operation, async () => {
      await load();
      if (panel.open) await showAdmin();
      notice("신고를 처리했어요.");
    });
  }
});

panel.addEventListener("change", event => {
  if (event.target.id === "flag-reason") {
    const duplicate = event.target.value === "duplicate";
    byId("duplicate-field").hidden = !duplicate;
    byId("duplicate-field").querySelector("select").required = duplicate;
  }
});

panel.addEventListener("submit", event => {
  event.preventDefault();
  const form = event.target;
  const button = event.submitter ?? form.querySelector('button[type="submit"]');
  if (form.id === "place-form") {
    const draft = draftFrom(form);
    if (!draft.categories.length) {
      const feedback = form.querySelector(".form-error");
      feedback.hidden = false;
      feedback.textContent = "간식을 하나 이상 골라 주세요.";
      return;
    }
    if (!state.point) { notice("위치를 다시 지정해 주세요."); return; }
    const [lat, lng] = state.point;
    mutate(button, { action: "place", ...draft, lat, lng }, async ({ id }) => {
      state.point = null;
      state.draft = null;
      map.draft(null);
      await load();
      categoryBar.querySelector('[data-category=""]').click();
      byId("today").checked = false;
      state.todayOnly = false;
      byId("search").value = "";
      state.query = "";
      await showPlace(id);
      notice("새 판매처를 등록했어요.");
    }, form);
  }
  if (form.id === "flag-form") {
    const data = new FormData(form);
    mutate(button, {
      action: "flag", placeId: state.pickedId, reason: data.get("reason"),
      notes: data.get("notes"), duplicateId: Number(data.get("duplicate")),
    }, () => { panel.close(); notice("신고를 받았어요."); }, form);
  }
});

await load();
if (params.has("place")) {
  await showPlace(Number(params.get("place")));
  if (params.get("action") === "flag" && state.pickedId) showFlag();
}
if (params.get("action") === "new" && state.viewer) startReport();
if (params.has("action")) {
  params.delete("action");
  history.replaceState(null, "", `${location.pathname}${params.size ? `?${params}` : ""}`);
}
setInterval(() => {
  if (!panel.open) { render(); return; }
  state.now = Date.now() + state.offset;
  const detail = byId("detail-status");
  const place = allPlaces().find(item => item.id === state.pickedId);
  if (detail && place) detail.innerHTML = statusMarkup(place);
  for (const time of panel.querySelectorAll("#history time")) {
    time.textContent = visitLabel(Date.parse(time.dateTime), state.now);
  }
}, 15000);
document.addEventListener("visibilitychange", () => { if (!document.hidden) load(); });
