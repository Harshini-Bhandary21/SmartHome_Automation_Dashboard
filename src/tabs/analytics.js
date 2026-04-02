import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

/* ── chart defaults ── */
const font = { family: 'Inter', size: 11 }
const monoFont = { family: 'IBM Plex Mono', size: 12 }

function tip() {
  return {
    backgroundColor: '#0F172A', titleColor: '#F8FAFC', bodyColor: '#CBD5E1',
    borderColor: '#334155', borderWidth: 1, padding: 10, cornerRadius: 8,
    titleFont: { family: 'Inter', size: 12, weight: '600' }, bodyFont: font
  }
}

function axes(xLabel = '', yLabel = '') {
  return {
    x: { title: { display: !!xLabel, text: xLabel, color: '#64748B', font }, grid: { color: '#F1F5F9' }, ticks: { color: '#64748B', font } },
    y: { title: { display: !!yLabel, text: yLabel, color: '#64748B', font }, grid: { color: '#F1F5F9' }, ticks: { color: '#64748B', font } }
  }
}

function baseOpts(xLabel = '', yLabel = '') {
  return {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: tip() },
    scales: axes(xLabel, yLabel)
  }
}

function legOpts() {
  return { display: true, labels: { color: '#64748B', font, padding: 14, usePointStyle: true, pointStyleWidth: 8 } }
}

const P = ['#2563EB', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316']

/* ── chart registry for updates ── */
const charts = {}

function destroyChart(id) { if (charts[id]) { charts[id].destroy(); delete charts[id] } }

function buildChart(id, type, data, opts) {
  destroyChart(id)
  const ctx = document.getElementById(id)
  if (!ctx) return
  charts[id] = new Chart(ctx, { type, data, options: opts })
}

/* ── compute stats from filtered sample ── */
function computeStats(sample) {
  const total = sample.length
  if (!total) return null

  const avg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
  const energies = sample.map(r => r.energy)
  const powers   = sample.map(r => r.power)
  const bws      = sample.map(r => r.bw)
  const offload1 = sample.filter(r => r.offload === 1).length
  const offload0 = total - offload1

  const appKeys  = ['tv', 'dryer', 'oven', 'fridge', 'micro']
  const appNames = ['Television', 'Dryer', 'Oven', 'Refrigerator', 'Microwave']
  const appCounts = appKeys.map(k => sample.filter(r => r[k] === 1).length)

  // Energy bins (10 buckets)
  const bins = Array(10).fill(0)
  energies.forEach(e => { const i = Math.min(Math.floor((e - 10) / 9), 9); bins[i]++ })

  // BW bins (10 buckets of 5K)
  const bwBins = Array(10).fill(0)
  const bwCloud = Array(10).fill(0), bwLocal = Array(10).fill(0)
  sample.forEach(r => {
    const i = Math.min(Math.floor(r.bw / 5000), 9)
    bwBins[i]++
    r.offload === 1 ? bwCloud[i]++ : bwLocal[i]++
  })

  // Avg energy ON vs OFF per appliance
  const avgE = appKeys.map(k => {
    const on = sample.filter(r => r[k] === 1).map(r => r.energy)
    const off = sample.filter(r => r[k] === 0).map(r => r.energy)
    return { on: +avg(on).toFixed(2), off: +avg(off).toFixed(2) }
  })

  return {
    total, offload1, offload0,
    avgEnergy: +avg(energies).toFixed(2),
    avgPower: +avg(powers).toFixed(0),
    avgBW: +(avg(bws) / 1000).toFixed(1),
    cloudRate: +((offload1 / total) * 100).toFixed(1),
    appCounts, appNames, appKeys, avgE,
    bins, bwBins, bwCloud, bwLocal,
    energies, powers, bws
  }
}

/* ═══════════════════════════════════════════
   RENDER
═══════════════════════════════════════════ */
export function renderAnalytics(panel, store) {
  panel.innerHTML = buildHTML()
  wireCharts(store.filtered())

  store.subscribe(filtered => {
    updateKPIs(filtered)
    wireCharts(filtered)
  })
}

/* ── HTML skeleton ── */
function buildHTML() {
  return `
  <!-- KPI ROW -->
  <div class="kpi-row" id="kpi-row">
    ${kpiCard('kpi-total', '📦', '--kc:#2563EB;--kb:#EFF6FF', '–', 'Total Records', '48,972 in full dataset')}
    ${kpiCard('kpi-energy','⚡', '--kc:#D97706;--kb:#FFFBEB', '–', 'Avg Energy (kWh)', '10 – 100 kWh range')}
    ${kpiCard('kpi-power', '🔌', '--kc:#8B5CF6;--kb:#F5F3FF', '–', 'Avg Power (VA)',   '1500 – 1999 VA')}
    ${kpiCard('kpi-bw',    '📡', '--kc:#0891B2;--kb:#ECFEFF', '–', 'Avg Bandwidth',    'Kbps')}
    ${kpiCard('kpi-cloud', '☁️', '--kc:#16A34A;--kb:#F0FDF4', '–', 'Cloud Offload %',  'vs local processing')}
  </div>

  <!-- ROW 1: Energy Dist + Offload Donut -->
  <div class="sec-divider"><div class="sec-divider-line"></div><div class="sec-divider-text">Energy & Offloading</div><div class="sec-divider-line"></div></div>
  <div class="grid-12">
    <div class="card">
      <div class="card-head">
        <div><div class="card-title">Energy Consumption Distribution</div><div class="card-sub">Count of records across 10 equal kWh bins</div></div>
        <span class="card-tag">Histogram</span>
      </div>
      <div class="chart-wrap"><canvas id="ch-energy-hist"></canvas></div>
    </div>
    <div class="card">
      <div class="card-head">
        <div><div class="card-title">Offload Split</div><div class="card-sub">Cloud vs local</div></div>
        <span class="card-tag">Donut</span>
      </div>
      <div class="chart-wrap"><canvas id="ch-offload-donut"></canvas></div>
    </div>
  </div>

  <!-- GAUGES -->
  <div class="gauge-row">
    <div class="gauge-card">
      <div class="gauge-lbl">Avg Energy</div>
      <svg class="gauge-svg" id="g-energy-svg" viewBox="0 0 150 84">
        <path d="M 8 76 A 66 66 0 0 1 142 76" fill="none" stroke="#E2E8F0" stroke-width="9" stroke-linecap="round"/>
        <path id="g-energy-arc" d="M 8 76 A 66 66 0 0 1 142 76" fill="none" stroke="#D97706" stroke-width="9" stroke-linecap="round"
          stroke-dasharray="207" stroke-dashoffset="103"/>
        <text id="g-energy-txt" x="75" y="68" text-anchor="middle" fill="#D97706" font-family="IBM Plex Mono" font-size="18" font-weight="600">–</text>
      </svg>
      <div class="gauge-num" style="color:#D97706" id="g-energy-num">–</div>
      <div class="gauge-hint">kWh average</div>
    </div>
    <div class="gauge-card">
      <div class="gauge-lbl">Avg Power</div>
      <svg class="gauge-svg" viewBox="0 0 150 84">
        <path d="M 8 76 A 66 66 0 0 1 142 76" fill="none" stroke="#E2E8F0" stroke-width="9" stroke-linecap="round"/>
        <path id="g-power-arc" d="M 8 76 A 66 66 0 0 1 142 76" fill="none" stroke="#8B5CF6" stroke-width="9" stroke-linecap="round"
          stroke-dasharray="207" stroke-dashoffset="103"/>
        <text id="g-power-txt" x="75" y="68" text-anchor="middle" fill="#8B5CF6" font-family="IBM Plex Mono" font-size="14" font-weight="600">–</text>
      </svg>
      <div class="gauge-num" style="color:#8B5CF6" id="g-power-num">–</div>
      <div class="gauge-hint">VA average</div>
    </div>
    <div class="gauge-card">
      <div class="gauge-lbl">Cloud Offload Rate</div>
      <svg class="gauge-svg" viewBox="0 0 150 84">
        <path d="M 8 76 A 66 66 0 0 1 142 76" fill="none" stroke="#E2E8F0" stroke-width="9" stroke-linecap="round"/>
        <path id="g-cloud-arc" d="M 8 76 A 66 66 0 0 1 142 76" fill="none" stroke="#16A34A" stroke-width="9" stroke-linecap="round"
          stroke-dasharray="207" stroke-dashoffset="103"/>
        <text id="g-cloud-txt" x="75" y="68" text-anchor="middle" fill="#16A34A" font-family="IBM Plex Mono" font-size="16" font-weight="600">–</text>
      </svg>
      <div class="gauge-num" style="color:#16A34A" id="g-cloud-num">–</div>
      <div class="gauge-hint">% of filtered records</div>
    </div>
  </div>

  <!-- ROW 2: Timeline + BW scatter -->
  <div class="grid-2">
    <div class="card">
      <div class="card-head">
        <div><div class="card-title">Energy Over Time</div><div class="card-sub">Sequential record values with running mean</div></div>
        <span class="card-tag">Timeline</span>
      </div>
      <div class="chart-wrap"><canvas id="ch-energy-time"></canvas></div>
    </div>
    <div class="card">
      <div class="card-head">
        <div><div class="card-title">Energy vs Bandwidth</div><div class="card-sub">Correlation between consumption & network</div></div>
        <span class="card-tag">Scatter</span>
      </div>
      <div class="chart-wrap"><canvas id="ch-e-bw"></canvas></div>
    </div>
  </div>

  <!-- ROW 3: Appliance section -->
  <div class="sec-divider"><div class="sec-divider-line"></div><div class="sec-divider-text">Appliance Analysis</div><div class="sec-divider-line"></div></div>
  <div class="grid-2">
    <div class="card">
      <div class="card-head">
        <div><div class="card-title">Appliance Usage Rates</div><div class="card-sub">% of filtered records where device is ON</div></div>
        <span class="card-tag">Bar</span>
      </div>
      <div class="chart-wrap sm"><canvas id="ch-app-bar"></canvas></div>
    </div>
    <div class="card">
      <div class="card-head">
        <div><div class="card-title">Avg Energy — ON vs OFF</div><div class="card-sub">Does device state shift energy use?</div></div>
        <span class="card-tag">Grouped Bar</span>
      </div>
      <div class="chart-wrap sm"><canvas id="ch-on-off"></canvas></div>
    </div>
  </div>
  <div class="grid-12">
    <div class="card">
      <div class="card-head">
        <div><div class="card-title">Usage Frequency — Analysis</div><div class="card-sub">Sorted by activation rate in filtered dataset</div></div>
        <span class="card-tag">Breakdown</span>
      </div>
      <div id="app-bar-list" class="bar-list" style="padding:4px 0"></div>
    </div>
    <div class="card">
      <div class="card-head">
        <div><div class="card-title">Device Share</div><div class="card-sub">Proportional usage</div></div>
        <span class="card-tag">Pie</span>
      </div>
      <div class="chart-wrap"><canvas id="ch-app-pie"></canvas></div>
    </div>
  </div>

  <!-- ROW 4: Network section -->
  <div class="sec-divider"><div class="sec-divider-line"></div><div class="sec-divider-text">Network & Voltage</div><div class="sec-divider-line"></div></div>
  <div class="grid-2">
    <div class="card">
      <div class="card-head">
        <div><div class="card-title">Bandwidth Distribution</div><div class="card-sub">Stacked by offload decision per 5K-bps bin</div></div>
        <span class="card-tag">Stacked Bar</span>
      </div>
      <div class="chart-wrap"><canvas id="ch-bw-stack"></canvas></div>
    </div>
    <div class="card">
      <div class="card-head">
        <div><div class="card-title">Line vs Measured Voltage</div><div class="card-sub">Grid supply vs household measurement</div></div>
        <span class="card-tag">Multi-Line</span>
      </div>
      <div class="chart-wrap"><canvas id="ch-voltage"></canvas></div>
    </div>
  </div>

  <!-- Insight -->
  <div class="insight">
    <strong>📊 Live Analysis: </strong>
    <span id="insight-text">Use the filters above to explore specific appliance states, offload decisions, and energy ranges. All charts update instantly.</span>
  </div>
  `
}

function kpiCard(id, ico, style, val, label, hint) {
  return `
    <div class="kpi" style="${style}">
      <div class="kpi-top">
        <div class="kpi-ico">${ico}</div>
        <div class="kpi-tag">Live</div>
      </div>
      <div class="kpi-val" id="${id}-val">${val}</div>
      <div class="kpi-lbl">${label}</div>
      <div class="kpi-hint" id="${id}-hint">${hint}</div>
    </div>`
}

/* ── KPI updater ── */
function updateKPIs(filtered) {
  const s = computeStats(filtered)
  if (!s) return

  const set = (id, val, hint) => {
    const v = document.getElementById(`${id}-val`)
    const h = document.getElementById(`${id}-hint`)
    if (v) v.textContent = val
    if (h) h.textContent = hint
  }

  set('kpi-total',  s.total.toLocaleString(),      `of 48,972 full records`)
  set('kpi-energy', s.avgEnergy + ' kWh',           `min ${Math.min(...s.energies).toFixed(1)} – max ${Math.max(...s.energies).toFixed(1)}`)
  set('kpi-power',  s.avgPower + ' VA',              `avg apparent power`)
  set('kpi-bw',     s.avgBW + 'K bps',              `avg bandwidth`)
  set('kpi-cloud',  s.cloudRate + '%',               `${s.offload1.toLocaleString()} cloud, ${s.offload0.toLocaleString()} local`)

  // Gauges
  const setGauge = (arcId, txtId, numId, value, displayTxt, numTxt, maxFraction) => {
    const arc = document.getElementById(arcId)
    const txt = document.getElementById(txtId)
    const num = document.getElementById(numId)
    if (!arc) return
    const offset = 207 - maxFraction * 207
    arc.setAttribute('stroke-dashoffset', offset)
    if (txt) txt.textContent = displayTxt
    if (num) num.textContent = numTxt
  }

  setGauge('g-energy-arc', 'g-energy-txt', 'g-energy-num', s.avgEnergy, s.avgEnergy, s.avgEnergy + ' kWh', s.avgEnergy / 100)
  setGauge('g-power-arc',  'g-power-txt',  'g-power-num',  s.avgPower,  s.avgPower,   s.avgPower + ' VA',  (s.avgPower - 1500) / 500)
  setGauge('g-cloud-arc',  'g-cloud-txt',  'g-cloud-num',  s.cloudRate, s.cloudRate + '%', s.cloudRate + '%', s.cloudRate / 100)

  // Insight
  const ins = document.getElementById('insight-text')
  if (ins) {
    ins.innerHTML = `Showing <strong>${s.total.toLocaleString()} records</strong> — avg energy <strong>${s.avgEnergy} kWh</strong>, avg power <strong>${s.avgPower} VA</strong>, cloud offload rate <strong>${s.cloudRate}%</strong>. ${s.total < 500 ? '⚠️ Small sample — results may have higher variance.' : 'Sample is statistically representative.'}`
  }
}

/* ── wire all charts ── */
function wireCharts(filtered) {
  updateKPIs(filtered)
  const s = computeStats(filtered)
  if (!s) {
    // show no-data state for charts
    return
  }

  const binLabels = ['10–19','19–28','28–37','37–46','46–55','55–64','64–73','73–82','82–91','91–100']
  const bwLabels  = ['0–5K','5–10K','10–15K','15–20K','20–25K','25–30K','30–35K','35–40K','40–45K','45–50K']

  // ── 1. Energy histogram
  buildChart('ch-energy-hist', 'bar', {
    labels: binLabels,
    datasets: [{ label: 'Records', data: s.bins,
      backgroundColor: s.bins.map((_, i) => `hsla(${220 + i * 8},80%,58%,0.2)`),
      borderColor: s.bins.map((_, i) => `hsl(${220 + i * 8},80%,50%)`),
      borderWidth: 1.5, borderRadius: 5, borderSkipped: false }]
  }, baseOpts('Energy (kWh)', 'Count'))

  // ── 2. Offload donut
  buildChart('ch-offload-donut', 'doughnut', {
    labels: ['☁ Cloud', '🖥 Local'],
    datasets: [{ data: [s.offload1, s.offload0],
      backgroundColor: ['rgba(37,99,235,.75)', 'rgba(245,158,11,.75)'],
      borderColor: ['#2563EB', '#F59E0B'], borderWidth: 2, hoverOffset: 6 }]
  }, {
    responsive: true, maintainAspectRatio: false, cutout: '67%',
    plugins: {
      legend: { position: 'bottom', labels: { color: '#64748B', font, padding: 14, usePointStyle: true } },
      tooltip: { ...tip(), callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw.toLocaleString()} (${((ctx.raw / s.total) * 100).toFixed(1)}%)` } }
    }
  })

  // ── 3. Energy timeline (up to 400 points)
  const pts = filtered.slice(0, 400)
  const avgLine = pts.map(() => s.avgEnergy)
  buildChart('ch-energy-time', 'line', {
    labels: pts.map((_, i) => i),
    datasets: [
      { label: 'Energy (kWh)', data: pts.map(r => r.energy), borderColor: '#2563EB', backgroundColor: 'rgba(37,99,235,.06)', borderWidth: 1.5, pointRadius: 0, fill: true, tension: 0.4 },
      { label: 'Mean',         data: avgLine,                 borderColor: '#EF4444', borderDash: [5, 3], borderWidth: 1.2, pointRadius: 0, fill: false }
    ]
  }, { ...baseOpts('Record index', 'Energy (kWh)'), plugins: { tooltip: tip(), legend: legOpts() } })

  // ── 4. Energy vs BW scatter
  buildChart('ch-e-bw', 'scatter', {
    datasets: [{
      label: 'E vs BW', data: pts.map(r => ({ x: +(r.bw / 1000).toFixed(1), y: r.energy })),
      backgroundColor: 'rgba(34,197,94,.4)', pointRadius: 3, pointHoverRadius: 5
    }]
  }, baseOpts('Bandwidth (Kbps)', 'Energy (kWh)'))

  // ── 5. Appliance usage bar
  buildChart('ch-app-bar', 'bar', {
    labels: ['📺 TV', '🌀 Dryer', '🍳 Oven', '❄️ Fridge', '📡 Micro'],
    datasets: [{ label: 'Usage %',
      data: s.appCounts.map(c => +((c / s.total) * 100).toFixed(2)),
      backgroundColor: P.map(c => c + '33'), borderColor: P, borderWidth: 1.5, borderRadius: 5 }]
  }, baseOpts('', 'Usage (%)'))

  // ── 6. ON vs OFF energy
  buildChart('ch-on-off', 'bar', {
    labels: ['📺 TV', '🌀 Dryer', '🍳 Oven', '❄️ Fridge', '📡 Micro'],
    datasets: [
      { label: 'ON',  data: s.avgE.map(e => e.on),  backgroundColor: 'rgba(34,197,94,.3)',  borderColor: '#22C55E', borderWidth: 1.5, borderRadius: 5 },
      { label: 'OFF', data: s.avgE.map(e => e.off), backgroundColor: 'rgba(245,158,11,.3)', borderColor: '#F59E0B', borderWidth: 1.5, borderRadius: 5 }
    ]
  }, { ...baseOpts('', 'Avg Energy (kWh)'), plugins: { tooltip: tip(), legend: legOpts() } })

  // ── 7. Bar list (analysis breakdown)
  const listEl = document.getElementById('app-bar-list')
  if (listEl) {
    const sorted = s.appNames.map((n, i) => ({
      n, emoji: ['📺','🌀','🍳','❄️','📡'][i],
      pct: +((s.appCounts[i] / s.total) * 100).toFixed(1),
      col: P[i]
    })).sort((a, b) => b.pct - a.pct)
    listEl.innerHTML = sorted.map(a => `
      <div class="bar-item">
        <div class="bar-name">${a.emoji} ${a.n}</div>
        <div class="bar-track"><div class="bar-fill" style="width:${a.pct}%;background:${a.col}"></div></div>
        <div class="bar-pct" style="color:${a.col}">${a.pct}%</div>
      </div>`).join('')
  }

  // ── 8. App pie
  buildChart('ch-app-pie', 'pie', {
    labels: ['📺 TV', '🌀 Dryer', '🍳 Oven', '❄️ Fridge', '📡 Micro'],
    datasets: [{ data: s.appCounts, backgroundColor: P.map(c => c + 'bb'), borderColor: P, borderWidth: 2, hoverOffset: 6 }]
  }, {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#64748B', font, padding: 10, usePointStyle: true } },
      tooltip: { ...tip(), callbacks: { label: ctx => ` ${ctx.label}: ${((ctx.raw / s.total) * 100).toFixed(1)}%` } }
    }
  })

  // ── 9. BW stacked
  buildChart('ch-bw-stack', 'bar', {
    labels: bwLabels,
    datasets: [
      { label: '☁ Cloud', data: s.bwCloud, backgroundColor: 'rgba(37,99,235,.35)',  borderColor: '#2563EB', borderWidth: 1.5, borderRadius: [4,4,0,0] },
      { label: '🖥 Local', data: s.bwLocal, backgroundColor: 'rgba(245,158,11,.35)', borderColor: '#F59E0B', borderWidth: 1.5, borderRadius: [4,4,0,0] }
    ]
  }, {
    responsive: true, maintainAspectRatio: false,
    plugins: { tooltip: tip(), legend: legOpts() },
    scales: {
      x: { stacked: true, ...axes('Bandwidth').x },
      y: { stacked: true, ...axes('', 'Count').y }
    }
  })

  // ── 10. Voltage comparison
  const v300 = filtered.slice(0, 300)
  buildChart('ch-voltage', 'line', {
    labels: v300.map((_, i) => i),
    datasets: [
      { label: 'Line V',     data: v300.map(r => r.lineV),   borderColor: '#22C55E', backgroundColor: 'transparent', borderWidth: 1.5, pointRadius: 0, tension: 0.3 },
      { label: 'Measured V', data: v300.map(r => r.voltage), borderColor: '#2563EB', backgroundColor: 'transparent', borderWidth: 1.5, pointRadius: 0, tension: 0.3 }
    ]
  }, {
    responsive: true, maintainAspectRatio: false,
    plugins: { tooltip: tip(), legend: legOpts() },
    scales: axes('Record Index', 'Voltage (V)')
  })
}
