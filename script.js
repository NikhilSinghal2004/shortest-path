const canvas = document.getElementById("mapCanvas");
const ctx = canvas.getContext("2d");
const info = document.getElementById("info");

const cities = {
  Delhi: { x: 150, y: 100 },
  Jaipur: { x: 100, y: 200 },
  Lucknow: { x: 250, y: 200 },
  Mumbai: { x: 80, y: 400 },
  Ahmedabad: { x: 120, y: 300 },
  Bhopal: { x: 200, y: 300 },
  Hyderabad: { x: 300, y: 400 },
  Bengaluru: { x: 300, y: 500 },
  Chennai: { x: 400, y: 520 },
  Kolkata: { x: 420, y: 220 },
  Patna: { x: 320, y: 180 },
  Ranchi: { x: 360, y: 260 }
};

const graph = {
  Delhi: { Jaipur: 270, Lucknow: 490 },
  Jaipur: { Delhi: 270, Ahmedabad: 650 },
  Lucknow: { Delhi: 490, Patna: 600 },
  Mumbai: { Ahmedabad: 520, Hyderabad: 710 },
  Ahmedabad: { Jaipur: 650, Mumbai: 520, Bhopal: 580 },
  Bhopal: { Ahmedabad: 580, Hyderabad: 780, Ranchi: 800 },
  Hyderabad: { Mumbai: 710, Bhopal: 780, Bengaluru: 570, Chennai: 630 },
  Bengaluru: { Hyderabad: 570, Chennai: 350 },
  Chennai: { Bengaluru: 350, Hyderabad: 630 },
  Kolkata: { Patna: 590, Ranchi: 390 },
  Patna: { Lucknow: 600, Kolkata: 590, Ranchi: 330 },
  Ranchi: { Patna: 330, Bhopal: 800, Kolkata: 390 }
};

let selected = [];

function drawMap() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let from in graph) {
    for (let to in graph[from]) {
      const a = cities[from];
      const b = cities[to];

      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = "#ccc";
      ctx.lineWidth = 2;
      ctx.stroke();

      const midX = (a.x + b.x) / 2;
      const midY = (a.y + b.y) / 2;
      ctx.fillStyle = "#444";
      ctx.fillText(graph[from][to], midX, midY);
    }
  }

  for (let name in cities) {
    const c = cities[name];
    ctx.beginPath();
    ctx.arc(c.x, c.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = "#007BFF";
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.font = "12px sans-serif";
    ctx.fillText(name, c.x - name.length * 2.5, c.y - 15);
  }
}

function dijkstra(start, end) {
  const dist = {}, prev = {}, visited = new Set();

  Object.keys(graph).forEach(c => {
    dist[c] = Infinity;
    prev[c] = null;
  });
  dist[start] = 0;

  while (visited.size < Object.keys(graph).length) {
    let u = null;
    for (let c in graph) {
      if (!visited.has(c) && (u === null || dist[c] < dist[u])) {
        u = c;
      }
    }

    if (u === end) break;
    visited.add(u);

    for (let v in graph[u]) {
      const alt = dist[u] + graph[u][v];
      if (alt < dist[v]) {
        dist[v] = alt;
        prev[v] = u;
      }
    }
  }

  const path = [];
  let curr = end;
  while (curr) {
    path.unshift(curr);
    curr = prev[curr];
  }
  return { path, distance: dist[end] };
}

function animateCar(path, totalDistance) {
  let i = 0;
  let covered = 0;

  function step() {
    if (i >= path.length - 1) return;

    const from = cities[path[i]];
    const to = cities[path[i + 1]];
    const steps = 100;

    const dx = (to.x - from.x) / steps;
    const dy = (to.y - from.y) / steps;

    let frame = 0;

    function moveSegment() {
      if (frame <= steps) {
        drawMap();
        const x = from.x + dx * frame;
        const y = from.y + dy * frame;

        ctx.font = "20px Arial";
        ctx.fillText("🚗", x, y);

        const partial = (graph[path[i]][path[i + 1]] * frame) / steps;
        info.innerText = `Distance covered: ${(covered + partial).toFixed(1)} / ${totalDistance} km`;

        frame++;
        requestAnimationFrame(moveSegment);
      } else {
        covered += graph[path[i]][path[i + 1]];
        i++;
        step();
      }
    }

    moveSegment();
  }

  step();
}

canvas.addEventListener("click", e => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  for (let name in cities) {
    const c = cities[name];
    const dx = x - c.x;
    const dy = y - c.y;

    if (dx * dx + dy * dy <= 100) {
      selected.push(name);
      if (selected.length === 2) {
        const result = dijkstra(selected[0], selected[1]);
        animateCar(result.path, result.distance);
        selected = [];
      }
      break;
    }
  }
});

drawMap();
