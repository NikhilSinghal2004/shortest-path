const canvas = document.getElementById("mapCanvas");
const ctx = canvas.getContext("2d");
const info = document.getElementById("info");

const districts = {
  Patna: { x: 400, y: 200 },
  Gaya: { x: 390, y: 300 },
  Muzaffarpur: { x: 450, y: 150 },
  Bhagalpur: { x: 550, y: 220 },
  Darbhanga: { x: 500, y: 140 },
  Purnia: { x: 600, y: 180 },
  Siwan: { x: 330, y: 170 },
  Arrah: { x: 360, y: 210 },
  Aurangabad: { x: 370, y: 330 },
  Begusarai: { x: 470, y: 200 },
  Buxar: { x: 320, y: 190 },
  Katihar: { x: 620, y: 200 },
  Motihari: { x: 480, y: 100 },
  Sitamarhi: { x: 470, y: 80 },
  Samastipur: { x: 470, y: 160 },
  Nalanda: { x: 410, y: 240 },
  Munger: { x: 510, y: 240 },
  Saharsa: { x: 540, y: 160 },
  Supaul: { x: 560, y: 120 },
  Araria: { x: 630, y: 150 }
};

const graph = {
  Patna: { Gaya: 100, Arrah: 60, Muzaffarpur: 80, Nalanda: 50 },
  Gaya: { Patna: 100, Aurangabad: 60, Nalanda: 80 },
  Muzaffarpur: { Patna: 80, Samastipur: 60, Sitamarhi: 70 },
  Bhagalpur: { Munger: 70, Katihar: 90 },
  Darbhanga: { Samastipur: 40, Saharsa: 100 },
  Purnia: { Katihar: 50, Araria: 60 },
  Siwan: { Arrah: 80, Muzaffarpur: 90 },
  Arrah: { Patna: 60, Siwan: 80, Buxar: 50 },
  Aurangabad: { Gaya: 60 },
  Begusarai: { Samastipur: 40, Munger: 60 },
  Buxar: { Arrah: 50 },
  Katihar: { Bhagalpur: 90, Purnia: 50 },
  Motihari: { Muzaffarpur: 90 },
  Sitamarhi: { Muzaffarpur: 70 },
  Samastipur: { Muzaffarpur: 60, Darbhanga: 40, Begusarai: 40 },
  Nalanda: { Patna: 50, Gaya: 80 },
  Munger: { Begusarai: 60, Bhagalpur: 70 },
  Saharsa: { Darbhanga: 100, Supaul: 50 },
  Supaul: { Saharsa: 50, Araria: 70 },
  Araria: { Supaul: 70, Purnia: 60 }
};

let selected = [];

function drawMap() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let from in graph) {
    const a = districts[from];
    for (let to in graph[from]) {
      const b = districts[to];
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = "#aaa";
      ctx.stroke();

      const midX = (a.x + b.x) / 2;
      const midY = (a.y + b.y) / 2;
      ctx.fillStyle = "#000";
      ctx.fillText(graph[from][to], midX, midY);
    }
  }

  for (let name in districts) {
    const d = districts[name];
    ctx.beginPath();
    ctx.arc(d.x, d.y, 8, 0, Math.PI * 2);
    ctx.fillStyle = "#007BFF";
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.fillText(name, d.x - name.length * 3, d.y - 12);
  }
}

function dijkstra(start, end) {
  const dist = {}, prev = {}, visited = new Set();
  Object.keys(graph).forEach(d => { dist[d] = Infinity; prev[d] = null; });
  dist[start] = 0;

  while (visited.size < Object.keys(graph).length) {
    let u = null;
    for (let d in graph) {
      if (!visited.has(d) && (u === null || dist[d] < dist[u])) u = d;
    }
    if (u === end) break;
    visited.add(u);

    for (let v in graph[u]) {
      let alt = dist[u] + graph[u][v];
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

    const from = districts[path[i]];
    const to = districts[path[i + 1]];
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
        info.innerText = `Distance: ${(covered + partial).toFixed(1)} / ${totalDistance} km`;

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

  for (let name in districts) {
    const d = districts[name];
    const dx = x - d.x;
    const dy = y - d.y;
    if (dx * dx + dy * dy < 100) {
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
