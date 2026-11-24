import { bounds, cats, center } from "./community.mjs";

const tileSize = 256;
const world = zoom => tileSize * 2 ** zoom;
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));

function project([lat, lng], zoom) {
  const size = world(zoom);
  const sin = Math.sin(clamp(lat, -85, 85) * Math.PI / 180);
  return [(lng + 180) / 360 * size, (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * size];
}

function unproject([x, y], zoom) {
  const size = world(zoom);
  return [Math.atan(Math.sinh(Math.PI * (1 - 2 * y / size))) * 180 / Math.PI, x / size * 360 - 180];
}

export function createMap(element, onPick, onSelect) {
  const tiles = element.querySelector(".tiles");
  const pins = element.querySelector(".pins");
  const cache = new Map();
  let focus = center, zoom = element.clientWidth < 520 ? 15.65 : 16.35;
  let records = [], chosen = null, draft = null, user = null, drag = null;

  function origin() {
    const [x, y] = project(focus, zoom);
    return [x - element.clientWidth / 2, y - element.clientHeight / 2];
  }

  function pin(point, node, [left, top]) {
    const [x, y] = project(point, zoom);
    node.style.left = `${x - left}px`;
    node.style.top = `${y - top}px`;
    pins.append(node);
  }

  function draw() {
    const [left, top] = origin();
    const level = Math.floor(zoom);
    const step = tileSize * 2 ** (zoom - level);
    const visible = new Set();
    for (let x = Math.floor(left / step); x <= Math.floor((left + element.clientWidth) / step); x++) {
      for (let y = Math.floor(top / step); y <= Math.floor((top + element.clientHeight) / step); y++) {
        const key = `${level}/${x}/${y}`;
        visible.add(key);
        let img = cache.get(key);
        if (!img) {
          img = new Image();
          img.alt = "";
          img.draggable = false;
          img.src = `https://tile.openstreetmap.org/${key}.png`;
          img.addEventListener("error", () => img.classList.add("tile-error"));
          cache.set(key, img);
        }
        if (!img.isConnected) tiles.append(img);
        img.style.cssText = `left:${x * step - left}px;top:${y * step - top}px;width:${step + .5}px;height:${step + .5}px`;
      }
    }
    for (const [key, img] of cache) {
      if (!visible.has(key)) img.remove();
      if (cache.size > 80 && !visible.has(key)) cache.delete(key);
    }

    const focused = document.activeElement?.dataset?.pin;
    pins.replaceChildren();
    for (const place of records) {
      const category = cats[place.categories[0]];
      const button = document.createElement("button");
      button.type = "button";
      button.className = `pin ${chosen === place.id ? "pin-selected" : ""}`;
      button.dataset.pin = place.id;
      button.style.setProperty("--pin", category.color);
      button.setAttribute("aria-label", `${place.name}${place.example ? " 예시" : ""}`);
      button.title = place.name;
      button.innerHTML = `<span aria-hidden="true">${category.emoji}</span>`;
      button.addEventListener("click", () => onSelect(place.id));
      pin([place.lat, place.lng], button, [left, top]);
      if (focused === String(place.id)) button.focus({ preventScroll: true });
    }
    for (const [point, style] of [[draft, "draft-pin"], [user, "user-pin"]]) {
      if (!point) continue;
      const node = document.createElement("span");
      node.className = style;
      node.setAttribute("aria-hidden", "true");
      pin(point, node, [left, top]);
    }
  }

  function move(point) {
    focus = [clamp(point[0], bounds.south, bounds.north), clamp(point[1], bounds.west, bounds.east)];
    draw();
  }

  function moveBy(dx, dy) {
    const [x, y] = project(focus, zoom);
    move(unproject([x + dx, y + dy], zoom));
  }

  element.addEventListener("pointerdown", event => {
    if (event.button !== 0 || event.target.closest("button")) return;
    drag = { x: event.clientX, y: event.clientY, center: project(focus, zoom), moved: false, id: event.pointerId };
  });
  element.addEventListener("pointermove", event => {
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) < 6) return;
    if (!drag.moved) element.setPointerCapture(event.pointerId);
    drag.moved = true;
    element.classList.add("dragging");
    move(unproject([drag.center[0] - dx, drag.center[1] - dy], zoom));
  });
  element.addEventListener("pointerup", event => {
    if (!drag || drag.id !== event.pointerId) return;
    const moved = drag.moved;
    drag = null;
    element.classList.remove("dragging");
    if (moved) return;
    const rect = element.getBoundingClientRect();
    const [x, y] = origin();
    onPick(unproject([x + event.clientX - rect.left, y + event.clientY - rect.top], zoom));
  });
  element.addEventListener("pointercancel", () => { drag = null; element.classList.remove("dragging"); });
  element.addEventListener("pointerleave", () => { if (!drag?.moved) drag = null; });
  element.addEventListener("keydown", event => {
    if (event.target !== element) return;
    const deltas = { ArrowUp: [0, -60], ArrowRight: [60, 0], ArrowDown: [0, 60], ArrowLeft: [-60, 0] };
    if (Object.hasOwn(deltas, event.key)) {
      event.preventDefault();
      moveBy(...deltas[event.key]);
    }
  });
  new ResizeObserver(draw).observe(element);
  return {
    draw(places, selection) { records = places; chosen = selection; draw(); },
    move,
    center: () => focus,
    zoom(amount) { zoom = clamp(zoom + amount, 14.8, 18.8); draw(); },
    draft(point) { draft = point; draw(); },
    locate(point) {
      user = point;
      if (point[0] >= bounds.south && point[0] <= bounds.north && point[1] >= bounds.west && point[1] <= bounds.east) move(point);
      else draw();
    },
  };
}
