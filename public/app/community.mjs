export const center = [37.5563, 126.9043];
export const bounds = { south: 37.5482, west: 126.8922, north: 37.5658, east: 126.9158 };
export const cats = {
  fish: { name: "붕어빵", color: "#fa754d", emoji: "🐟" },
  pancake: { name: "호떡", color: "#e9a238", emoji: "🥞" },
  potato: { name: "군고구마", color: "#9574a0", emoji: "🍠" },
  cake: { name: "어묵", color: "#7b9662", emoji: "🍢" },
  other: { name: "기타", color: "#8f8b7b", emoji: "🌰" },
};
export const statuses = { selling: "판매 중", sold_out: "품절", missing: "현장에서 못 찾음" };
const day = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul", dateStyle: "short" });
const clock = new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
const week = 7 * 24 * 60 * 60 * 1000;

export function localTime(value) {
  return clock.format(value);
}

export function visitLabel(value, now) {
  const date = day.format(value);
  return `${date === day.format(now) ? "오늘" : date.slice(5).replace("-", ".")} ${localTime(value)}`;
}

export function statusFor(place, now) {
  const { latest, confirmedAt } = place;
  return {
    today: latest && day.format(latest.at) === day.format(now) ? latest : null,
    stale: confirmedAt == null || now - confirmedAt >= week,
  };
}

export function validPoint(lat, lng) {
  return Number.isFinite(lat) && Number.isFinite(lng) &&
    lat >= bounds.south && lat <= bounds.north && lng >= bounds.west && lng <= bounds.east;
}

export function distance(from, to) {
  const rad = Math.PI / 180;
  const [lat1, lng1] = from.map(value => value * rad);
  const [lat2, lng2] = to.map(value => value * rad);
  const arc = Math.sin((lat2 - lat1) / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) *
    Math.sin((lng2 - lng1) / 2) ** 2;
  return 6371000 * 2 * Math.asin(Math.sqrt(Math.min(1, arc)));
}

export function nearby(places, point, meters = 55) {
  return places.map(place => ({ ...place, meters: distance(point, [place.lat, place.lng]) }))
    .filter(place => place.meters <= meters).sort((a, b) => a.meters - b.meters);
}

export function filterPlaces(places, { category, todayOnly, query }, now, origin) {
  const term = query.trim().toLowerCase();
  return places.filter(place => {
    if (category && !place.categories.includes(category)) return false;
    if (todayOnly && statusFor(place, now).today?.status !== "selling") return false;
    return !term || [place.name, place.directions, ...place.categories.map(key => cats[key].name)]
      .some(value => value.toLowerCase().includes(term));
  }).map(place => ({ ...place, meters: distance(origin, [place.lat, place.lng]) }))
    .sort((a, b) => a.meters - b.meters || a.id - b.id);
}

export function examples(now) {
  const startOfDay = Date.parse(`${day.format(now)}T00:00:00+09:00`);
  const fixtures = [
    ["망원시장 입구 붕어빵", "fish", 37.55679, 126.90532, "시장 입구 쪽, 꽃집 맞은편", "selling", 0],
    ["골목 끝 찹쌀호떡", "pancake", 37.55520, 126.90468, "망원시장 남쪽 골목 입구", "selling", 0],
    ["망원역 군고구마", "potato", 37.55502, 126.91012, "망원역 2번 출구 근처", "sold_out", 0],
    ["월드컵시장 따끈어묵", "cake", 37.55816, 126.90495, "월드컵시장 안쪽 사거리", "selling", 1],
    ["한강 가는 길 붕어빵", "fish", 37.55329, 126.89920, "한강공원 방향 큰길 근처", "selling", 8],
    ["망원동 꿀호떡", "pancake", 37.55922, 126.90018, "망원로 사거리 근처", "selling", 0],
  ];
  return fixtures.map(([name, category, lat, lng, directions, status, days], index) => {
    const hours = [16.3, 16.05, 15.55, 14.2, 13.4, 15][index];
    const at = Math.min(now, startOfDay + (hours - days * 24) * 3600000);
    return { id: -index - 1, name, categories: [category], lat, lng, directions,
      latest: { status, at }, confirmedAt: at, example: true };
  });
}
