import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

// ===== LIGHT THEME CHART DEFAULTS =====
const C = {
  blue:   '#2563EB', blueFill: 'rgba(37,99,235,0.08)',
  green:  '#22C55E', greenFill:'rgba(34,197,94,0.1)',
  amber:  '#F59E0B', amberFill:'rgba(245,158,11,0.1)',
  red:    '#EF4444', redFill:  'rgba(239,68,68,0.1)',
  purple: '#8B5CF6', purpleFill:'rgba(139,92,246,0.1)',
  cyan:   '#06B6D4', cyanFill: 'rgba(6,182,212,0.1)',
  orange: '#F97316',
  text:   '#64748B',
  grid:   '#F1F5F9',
  border: '#E2E8F0',
}

function baseOpts(xLabel = '', yLabel = '') {
  return {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0F172A',
        titleColor: '#F8FAFC', bodyColor: '#CBD5E1',
        borderColor: '#334155', borderWidth: 1,
        padding: 10, cornerRadius: 8,
        titleFont: { family: 'IBM Plex Sans', size: 12, weight: '600' },
        bodyFont:  { family: 'Inter', size: 12 },
      }
    },
    scales: {
      x: {
        title: { display: !!xLabel, text: xLabel, color: C.text, font: { family: 'Inter', size: 11 } },
        grid:  { color: C.grid },
        ticks: { color: C.text, font: { family: 'Inter', size: 11 } }
      },
      y: {
        title: { display: !!yLabel, text: yLabel, color: C.text, font: { family: 'Inter', size: 11 } },
        grid:  { color: C.grid },
        ticks: { color: C.text, font: { family: 'Inter', size: 11 } }
      }
    }
  }
}

export function renderOverview(panel, data) {
  const s = data.summary
  const CHART_PALETTE = [C.blue, C.green, C.amber, C.red, C.purple]

  panel.innerHTML = `
    <!-- Page Header -->
    <div class="page-header">
      <div class="page-header-row">
        <div class="page-title">Dashboard Overview</div>
        <span style="font-size:12px;color:var(--text-muted);background:var(--bg-card2);border:1px solid var(--border);padding:4px 12px;border-radius:20px;">
          Jan 2020 – Nov 2023 &nbsp;·&nbsp; ${s.totalRecords.toLocaleString()} records
        </span>
      </div>
      <div class="page-desc">Smart Home Automation IoT — Energy consumption, appliance state & network offloading analytics</div>
    </div>

    <!-- KPI Row -->
    <div class="kpi-grid">
      <div class="kpi-card" style="--kpi-color:#2563EB;--kpi-bg:#EFF6FF">
        <div class="kpi-top">
          <div class="kpi-icon-wrap">📦</div>
          <div class="kpi-badge">↑ Full</div>
        </div>
        <div class="kpi-value">${(s.totalRecords/1000).toFixed(1)}K</div>
        <div class="kpi-label">Total Records</div>
        <div class="kpi-sub">48,972 IoT transactions</div>
      </div>
      <div class="kpi-card" style="--kpi-color:#22C55E;--kpi-bg:#F0FDF4">
        <div class="kpi-top">
          <div class="kpi-icon-wrap">⚡</div>
          <div class="kpi-badge">↑ Avg</div>
        </div>
        <div class="kpi-value">${s.avgEnergy}</div>
        <div class="kpi-label">Avg Energy (kWh)</div>
        <div class="kpi-sub">Range: ${s.minEnergy} – ${s.maxEnergy} kWh</div>
      </div>
      <div class="kpi-card" style="--kpi-color:#F59E0B;--kpi-bg:#FFFBEB">
        <div class="kpi-top">
          <div class="kpi-icon-wrap">🔌</div>
          <div class="kpi-badge">↑ Avg</div>
        </div>
        <div class="kpi-value">${s.avgPower.toFixed(0)}</div>
        <div class="kpi-label">Avg Power (VA)</div>
        <div class="kpi-sub">${s.minPower} – ${s.maxPower} VA</div>
      </div>
      <div class="kpi-card" style="--kpi-color:#06B6D4;--kpi-bg:#ECFEFF">
        <div class="kpi-top">
          <div class="kpi-icon-wrap">📡</div>
          <div class="kpi-badge">↑ Avg</div>
        </div>
        <div class="kpi-value">${(s.avgBandwidth/1000).toFixed(1)}K</div>
        <div class="kpi-label">Avg Bandwidth (bps)</div>
        <div class="kpi-sub">Range: 2 – 48,970 bps</div>
      </div>
      <div class="kpi-card" style="--kpi-color:#8B5CF6;--kpi-bg:#F5F3FF">
        <div class="kpi-top">
          <div class="kpi-icon-wrap">☁️</div>
          <div class="kpi-badge">↑ Rate</div>
        </div>
        <div class="kpi-value">${((s.offload1/s.totalRecords)*100).toFixed(1)}%</div>
        <div class="kpi-label">Cloud Offload Rate</div>
        <div class="kpi-sub">${s.offload1.toLocaleString()} tasks offloaded</div>
      </div>
      <div class="kpi-card" style="--kpi-color:#F97316;--kpi-bg:#FFF7ED">
        <div class="kpi-top">
          <div class="kpi-icon-wrap">🏠</div>
          <div class="kpi-badge">↑ All</div>
        </div>
        <div class="kpi-value">5</div>
        <div class="kpi-label">Tracked Appliances</div>
        <div class="kpi-sub">TV · Dryer · Oven · Fridge · Micro</div>
      </div>
    </div>

    <!-- Charts Row 1 -->
    <div class="section-sep"><div class="section-sep-line"></div><div class="section-sep-label">Key Visualizations</div><div class="section-sep-line"></div></div>

    <div class="chart-grid chart-grid-12">
      <div class="chart-card">
        <div class="chart-header">
          <div class="chart-header-left">
            <div class="chart-title">Energy Consumption Distribution</div>
            <div class="chart-subtitle">Histogram across 10 equal bins (10–100 kWh)</div>
          </div>
          <span class="chart-badge">48,972 records</span>
        </div>
        <div class="chart-container"><canvas id="chart-energy-dist"></canvas></div>
      </div>
      <div class="chart-card">
        <div class="chart-header">
          <div class="chart-header-left">
            <div class="chart-title">Offloading Decision Split</div>
            <div class="chart-subtitle">Cloud vs local processing ratio</div>
          </div>
          <span class="chart-badge">Donut</span>
        </div>
        <div class="chart-container"><canvas id="chart-offload-donut"></canvas></div>
      </div>
    </div>

    <div class="chart-grid chart-grid-2">
      <div class="chart-card">
        <div class="chart-header">
          <div class="chart-header-left">
            <div class="chart-title">Appliance Usage Frequency</div>
            <div class="chart-subtitle">Active state count per device</div>
          </div>
          <span class="chart-badge">Bar</span>
        </div>
        <div class="chart-container short"><canvas id="chart-appliance-bar"></canvas></div>
      </div>
      <div class="chart-card">
        <div class="chart-header">
          <div class="chart-header-left">
            <div class="chart-title">Energy vs Apparent Power</div>
            <div class="chart-subtitle">Sample of 500 records</div>
          </div>
          <span class="chart-badge">Scatter</span>
        </div>
        <div class="chart-container short"><canvas id="chart-scatter-ep"></canvas></div>
      </div>
    </div>

    <!-- Insight -->
    <div class="insight-box">
      <strong>📊 Overview Analysis: </strong>
      The Smart Home Automation dataset contains <strong>${s.totalRecords.toLocaleString()} records</strong> spanning January 2020 – November 2023.
      Average energy consumption is <strong>${s.avgEnergy} kWh</strong>, uniformly distributed across the 10–100 kWh range, indicating diverse household activity.
      Cloud offloading occurs in <strong>${((s.offload1/s.totalRecords)*100).toFixed(1)}%</strong> of transactions — near-equal split with local processing, suggesting a balanced edge-cloud architecture.
      All five appliances show approximately equal usage frequency (~50%), confirming unbiased smart automation across all devices.
    </div>
  `

  // Energy distribution histogram
  const binLabels = ['10–19','19–28','28–37','37–46','46–55','55–64','64–73','73–82','82–91','91–100']
  new Chart(document.getElementById('chart-energy-dist'), {
    type: 'bar',
    data: {
      labels: binLabels,
      datasets: [{
        label: 'Records',
        data: s.energyBins,
        backgroundColor: C.blue + '22',
        borderColor: C.blue,
        borderWidth: 1.5,
        borderRadius: 5,
        borderSkipped: false,
      }]
    },
    options: {
      ...baseOpts('Energy (kWh)', 'Count'),
      plugins: {
        ...baseOpts().plugins,
        tooltip: { ...baseOpts().plugins.tooltip, callbacks: { label: ctx => ` ${ctx.raw.toLocaleString()} records` } }
      }
    }
  })

  // Donut
  new Chart(document.getElementById('chart-offload-donut'), {
    type: 'doughnut',
    data: {
      labels: ['Cloud Offload', 'Local Processing'],
      datasets: [{
        data: [s.offload1, s.offload0],
        backgroundColor: [C.blue + 'dd', C.amber + 'dd'],
        borderColor: [C.blue, C.amber],
        borderWidth: 2, hoverOffset: 6
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '68%',
      plugins: {
        legend: { position:'bottom', labels:{ color:C.text, font:{ family:'Inter', size:12 }, padding:16, usePointStyle:true } },
        tooltip: { ...baseOpts().plugins.tooltip, callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw.toLocaleString()} (${((ctx.raw/s.totalRecords)*100).toFixed(1)}%)` } }
      }
    }
  })

  // Appliance bar
  const appNames  = ['Television','Dryer','Oven','Refrigerator','Microwave']
  const appColors = [C.blue, C.green, C.amber, C.cyan, C.purple]
  new Chart(document.getElementById('chart-appliance-bar'), {
    type: 'bar',
    data: {
      labels: appNames,
      datasets: [{
        label: 'Active States',
        data: appNames.map(a => s.applianceCounts[a]),
        backgroundColor: appColors.map(c => c + '33'),
        borderColor: appColors,
        borderWidth: 1.5, borderRadius: 5,
      }]
    },
    options: {
      ...baseOpts('Appliance', 'Active Count'),
      plugins: { ...baseOpts().plugins }
    }
  })

  // Scatter energy vs power
  const scatter500 = data.sample.slice(0,500).map(r => ({ x:r.energy, y:r.power }))
  new Chart(document.getElementById('chart-scatter-ep'), {
    type: 'scatter',
    data: {
      datasets: [{
        label: 'Energy vs Power',
        data: scatter500,
        backgroundColor: C.blue + '55',
        borderColor: C.blue + '99',
        pointRadius: 3, pointHoverRadius: 5,
      }]
    },
    options: baseOpts('Energy (kWh)', 'Apparent Power (VA)')
  })
}
