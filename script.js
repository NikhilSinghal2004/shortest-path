const canvas = document.getElementById("mapCanvas");
const ctx = canvas.getContext("2d");
const distanceInfo = document.getElementById("distanceInfo");

const cities = {
  Delhi: { x: 500, y: 100 }, Mumbai: { x: 200, y: 400 }, Kolkata: { x: 800, y: 200 },
  Chennai: { x: 700, y: 450 }, Bengaluru: { x: 600, y: 500 }, Hyderabad: { x: 500, y: 400 },
  Ahmedabad: { x: 300, y: 300 }, Pune: { x: 250, y: 420 }, Jaipur: { x: 400, y: 200 },
  Lucknow: { x: 600, y: 150 }, Bhopal: { x: 400, y: 350 }, Indore: { x: 350, y: 370 },
  Patna: { x: 700, y: 180 }, Ranchi: { x: 700, y: 250 }, Surat: { x: 280, y: 340 },
  Kanpur: { x: 580, y: 170 }, Varanasi: { x: 640, y: 180 }, Nagpur: { x: 450, y: 420 },
  Vishakhapatnam: { x: 700, y: 360 }, Guwahati: { x: 850, y: 100 }
};

const roads = {
  Delhi: { Jaipur: 250, Lucknow: 400 }, Jaipur: { Ahmedabad: 300 },
  Ahmedabad: { Surat: 150, Indore: 350 }, Surat: { Mumbai: 300 },
  Mumbai: { Pune: 150 }, Pune: { Hyderabad: 400 },
  Hyderabad: { Nagpur: 300, Bengaluru: 500 }, Nagpur: { Bhopal: 300 },
  Bhopal: { Indore: 200, Kanpur: 450 }, Kanpur: { Lucknow: 100, Varanasi: 300 },
  Lucknow: { Patna: 400 }, Varanasi: { Patna: 250 }, Patna: { Ranchi: 200 },
  Ranchi: { Kolkata: 300 }, Kolkata: { Guwahati: 450, Vishakhapatnam: 500 },
  Vishakhapatnam: { Chennai: 400 }, Chennai: { Bengaluru: 350 }
};

// Make roads bidirectional
for (let city in roads) {
  for (let neighbor in roads[city]) {
    if (!roads[neighbor]) roads[neighbor] = {};
    roads[neighbor][city] = roads[city][neighbor];
  }
}

let selected = [];
let shortestPath = [];
let secondPath = [];

function drawMap() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let city in roads) {
    const from = cities[city];
    for (let target in roads[city]) {
      const to = cities[target];
      const key = `${city}-${target}`;

      if (shortestPath.includes(key) || shortestPath.includes(`${target}-${city}`)) {
        ctx.strokeStyle = "#28a745"; // Green
        ctx.lineWidth = 4;
      } else if (secondPath.includes(key) || secondPath.includes(`${target}-${city}`)) {
        ctx.strokeStyle = "#ffc107"; // Yellow
        ctx.lineWidth = 3;
      } else {
        ctx.strokeStyle = "#ffffff"; // Default white road
        ctx.lineWidth = 2;
      }

      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();

      // Show distance only on colored roads
      if (ctx.strokeStyle !== "#ffffff") {
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2;
        ctx.fillStyle = "#000";
        ctx.font = "12px Arial";
        ctx.fillText(roads[city][target], midX, midY);
      }
    }
  }

  for (let name in cities) {
    const point = cities[name];
    ctx.beginPath();
    ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = "#1976d2";
    ctx.fill();

    ctx.fillStyle = "#000";
    ctx.font = "bold 16px Segoe UI";
    ctx.textAlign = "center";
    ctx.fillText(name, point.x, point.y - 12);
  }
}

function dijkstra(start, end, blockedEdges = []) {
  const dist = {}, prev = {}, visited = new Set();
  for (let city in roads) {
    dist[city] = Infinity;
    prev[city] = null;
  }
  dist[start] = 0;

  while (visited.size < Object.keys(roads).length) {
    let u = null;
    for (let city in roads) {
      if (!visited.has(city) && (u === null || dist[city] < dist[u])) u = city;
    }
    if (u === end || dist[u] === Infinity) break;
    visited.add(u);

    for (let v in roads[u]) {
      let edge = `${u}-${v}`;
      if (blockedEdges.includes(edge)) continue;
      let alt = dist[u] + roads[u][v];
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

function pathToEdges(path) {
  const edges = [];
  for (let i = 0; i < path.length - 1; i++) {
    edges.push(`${path[i]}-${path[i + 1]}`);
  }
  return edges;
}

canvas.addEventListener("click", e => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  for (let city in cities) {
    const d = cities[city];
    const dx = x - d.x;
    const dy = y - d.y;
    if (dx * dx + dy * dy < 100) {
      selected.push(city);
      if (selected.length === 2) {
        const first = dijkstra(selected[0], selected[1]);
        const blockedEdges = pathToEdges(first.path);
        const second = dijkstra(selected[0], selected[1], blockedEdges);

        shortestPath = blockedEdges;
        secondPath = pathToEdges(second.path);

        distanceInfo.innerText = `Shortest path distance: ${first.distance} km`;
        drawMap();
        selected = [];
      }
      break;
    }
  }
});

drawMap();
