import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

const C = {
  blue:'#2563EB', green:'#22C55E', amber:'#F59E0B',
  red:'#EF4444', purple:'#8B5CF6', cyan:'#06B6D4',
  text:'#64748B', grid:'#F1F5F9',
}

function baseOpts(xLabel='', yLabel='') {
  return {
    responsive:true, maintainAspectRatio:false,
    plugins:{
      legend:{display:false},
      tooltip:{
        backgroundColor:'#0F172A', titleColor:'#F8FAFC', bodyColor:'#CBD5E1',
        borderColor:'#334155', borderWidth:1, padding:10, cornerRadius:8,
        titleFont:{family:'IBM Plex Sans',size:12,weight:'600'},
        bodyFont:{family:'Inter',size:12},
      }
    },
    scales:{
      x:{title:{display:!!xLabel,text:xLabel,color:C.text,font:{family:'Inter',size:11}},grid:{color:C.grid},ticks:{color:C.text,font:{family:'Inter',size:11},maxTicksLimit:10}},
      y:{title:{display:!!yLabel,text:yLabel,color:C.text,font:{family:'Inter',size:11}},grid:{color:C.grid},ticks:{color:C.text,font:{family:'Inter',size:11}}}
    }
  }
}

function legendOpts() {
  return { display:true, labels:{ color:C.text, font:{family:'Inter',size:12}, padding:16, usePointStyle:true } }
}

export function renderEnergy(panel, data) {
  const s = data.summary, sample = data.sample

  panel.innerHTML = `
    <div class="page-header">
      <div class="page-title">Energy Analysis</div>
      <div class="page-desc">Consumption patterns, power relationships and offloading behaviour across ${s.totalRecords.toLocaleString()} records</div>
    </div>

    <!-- Filters -->
    <div class="filters-bar">
      <div class="filter-group">
        <span class="filter-label">Sample Size</span>
        <select class="filter-select" id="energy-filter-count">
          <option value="200">200 records</option>
          <option value="500" selected>500 records</option>
          <option value="1000">1,000 records</option>
          <option value="2000">2,000 (all)</option>
        </select>
      </div>
      <div class="filter-divider"></div>
      <div class="filter-group">
        <span class="filter-label">Offload Type</span>
        <select class="filter-select" id="energy-filter-offload">
          <option value="all">All Transactions</option>
          <option value="1">Cloud Offload Only</option>
          <option value="0">Local Processing Only</option>
        </select>
      </div>
      <div style="margin-left:auto;display:flex;gap:8px;align-items:center">
        <span style="font-size:11px;color:var(--text-muted)">Avg Energy:</span>
        <span style="font-size:13px;font-weight:700;color:var(--primary);font-family:'IBM Plex Mono',monospace">${s.avgEnergy} kWh</span>
        <span style="font-size:11px;color:var(--text-muted)">| Avg Power:</span>
        <span style="font-size:13px;font-weight:700;color:var(--warning);font-family:'IBM Plex Mono',monospace">${s.avgPower.toFixed(0)} VA</span>
      </div>
    </div>

    <!-- Gauges -->
    <div class="gauge-grid">
      <div class="gauge-card">
        <div class="gauge-label">Avg Energy Consumption</div>
        <svg class="gauge-svg" viewBox="0 0 160 90">
          <path d="M 10 80 A 70 70 0 0 1 150 80" fill="none" stroke="#E2E8F0" stroke-width="10" stroke-linecap="round"/>
          <path d="M 10 80 A 70 70 0 0 1 150 80" fill="none" stroke="${C.blue}" stroke-width="10" stroke-linecap="round"
            stroke-dasharray="220" stroke-dashoffset="${220-(s.avgEnergy/100)*220}"/>
          <text x="80" y="72" text-anchor="middle" fill="${C.blue}" font-family="IBM Plex Mono" font-size="20" font-weight="700">${s.avgEnergy}</text>
          <text x="80" y="85" text-anchor="middle" fill="#94A3B8" font-family="Inter" font-size="9">kWh</text>
        </svg>
        <div class="gauge-value" style="color:${C.blue}">${s.avgEnergy} kWh</div>
        <div class="gauge-sub">Range: ${s.minEnergy} – ${s.maxEnergy} kWh</div>
      </div>
      <div class="gauge-card">
        <div class="gauge-label">Avg Apparent Power</div>
        <svg class="gauge-svg" viewBox="0 0 160 90">
          <path d="M 10 80 A 70 70 0 0 1 150 80" fill="none" stroke="#E2E8F0" stroke-width="10" stroke-linecap="round"/>
          <path d="M 10 80 A 70 70 0 0 1 150 80" fill="none" stroke="${C.amber}" stroke-width="10" stroke-linecap="round"
            stroke-dasharray="220" stroke-dashoffset="${220-((s.avgPower-1500)/500)*220}"/>
          <text x="80" y="72" text-anchor="middle" fill="${C.amber}" font-family="IBM Plex Mono" font-size="16" font-weight="700">${s.avgPower.toFixed(0)}</text>
          <text x="80" y="85" text-anchor="middle" fill="#94A3B8" font-family="Inter" font-size="9">VA</text>
        </svg>
        <div class="gauge-value" style="color:${C.amber}">${s.avgPower.toFixed(0)} VA</div>
        <div class="gauge-sub">Range: ${s.minPower} – ${s.maxPower} VA</div>
      </div>
      <div class="gauge-card">
        <div class="gauge-label">Cloud Offload Rate</div>
        <svg class="gauge-svg" viewBox="0 0 160 90">
          <path d="M 10 80 A 70 70 0 0 1 150 80" fill="none" stroke="#E2E8F0" stroke-width="10" stroke-linecap="round"/>
          <path d="M 10 80 A 70 70 0 0 1 150 80" fill="none" stroke="${C.green}" stroke-width="10" stroke-linecap="round"
            stroke-dasharray="220" stroke-dashoffset="${220-(s.offload1/s.totalRecords)*220}"/>
          <text x="80" y="72" text-anchor="middle" fill="${C.green}" font-family="IBM Plex Mono" font-size="18" font-weight="700">${((s.offload1/s.totalRecords)*100).toFixed(1)}%</text>
          <text x="80" y="85" text-anchor="middle" fill="#94A3B8" font-family="Inter" font-size="9">of total</text>
        </svg>
        <div class="gauge-value" style="color:${C.green}">${((s.offload1/s.totalRecords)*100).toFixed(1)}%</div>
        <div class="gauge-sub">${s.offload1.toLocaleString()} tasks offloaded</div>
      </div>
    </div>

    <!-- Charts -->
    <div class="section-sep"><div class="section-sep-line"></div><div class="section-sep-label">Trend & Correlation Charts</div><div class="section-sep-line"></div></div>

    <div class="chart-grid chart-grid-2">
      <div class="chart-card">
        <div class="chart-header">
          <div class="chart-header-left">
            <div class="chart-title">Energy Consumption Over Time</div>
            <div class="chart-subtitle">First 500 records with running average</div>
          </div>
          <span class="chart-badge">Timeline</span>
        </div>
        <div class="chart-container"><canvas id="chart-energy-time"></canvas></div>
      </div>
      <div class="chart-card">
        <div class="chart-header">
          <div class="chart-header-left">
            <div class="chart-title">Energy vs Bandwidth</div>
            <div class="chart-subtitle">Correlation analysis (500 points)</div>
          </div>
          <span class="chart-badge">Scatter</span>
        </div>
        <div class="chart-container"><canvas id="chart-energy-bw"></canvas></div>
      </div>
    </div>

    <div class="chart-grid chart-grid-2">
      <div class="chart-card">
        <div class="chart-header">
          <div class="chart-header-left">
            <div class="chart-title">Power vs Voltage Relationship</div>
            <div class="chart-subtitle">Ohm's law validation</div>
          </div>
          <span class="chart-badge">Scatter</span>
        </div>
        <div class="chart-container"><canvas id="chart-pv-scatter"></canvas></div>
      </div>
      <div class="chart-card">
        <div class="chart-header">
          <div class="chart-header-left">
            <div class="chart-title">Energy by Offloading Decision</div>
            <div class="chart-subtitle">Cloud vs local — energy range comparison</div>
          </div>
          <span class="chart-badge">Grouped Bar</span>
        </div>
        <div class="chart-container"><canvas id="chart-energy-offload"></canvas></div>
      </div>
    </div>

    <div class="insight-box">
      <strong>⚡ Energy Analysis: </strong>
      Energy consumption is uniformly distributed between <strong>10–100 kWh</strong> (mean: <strong>${s.avgEnergy} kWh</strong>), indicating balanced synthetic data across all household scenarios.
      Apparent Power uniformly spans <strong>${s.minPower}–${s.maxPower} VA</strong> (mean: ${s.avgPower.toFixed(0)} VA). No strong correlation exists between energy and bandwidth, suggesting offloading is governed by task type and device load rather than current energy consumption.
      The power-voltage scatter confirms Ohm's law adherence with minor variance from differing power factors across appliance combinations.
    </div>
  `

  const pts = sample.slice(0,500)

  // Timeline
  new Chart(document.getElementById('chart-energy-time'), {
    type: 'line',
    data: {
      labels: pts.map((_,i)=>i),
      datasets: [
        { label:'Energy (kWh)', data:pts.map(r=>r.energy), borderColor:C.blue, backgroundColor:'rgba(37,99,235,0.06)', borderWidth:1.5, pointRadius:0, fill:true, tension:0.4 },
        { label:'Avg', data:pts.map(()=>s.avgEnergy), borderColor:C.red, borderDash:[5,3], borderWidth:1.2, pointRadius:0, fill:false }
      ]
    },
    options: { ...baseOpts('Record Index','Energy (kWh)'), plugins:{ ...baseOpts().plugins, legend:legendOpts() } }
  })

  // BW scatter
  new Chart(document.getElementById('chart-energy-bw'), {
    type:'scatter',
    data:{ datasets:[{ label:'Energy vs BW', data:pts.map(r=>({x:r.bw/1000,y:r.energy})), backgroundColor:C.green+'66', pointRadius:3 }] },
    options: baseOpts('Bandwidth (Kbps)','Energy (kWh)')
  })

  // Power vs Voltage
  new Chart(document.getElementById('chart-pv-scatter'), {
    type:'scatter',
    data:{ datasets:[{ label:'Power vs Voltage', data:pts.map(r=>({x:r.voltage,y:r.power})), backgroundColor:C.amber+'77', pointRadius:3 }] },
    options: baseOpts('Voltage (V)','Power (VA)')
  })

  // Energy by offload
  const cloudBins = Array(5).fill(0), localBins = Array(5).fill(0)
  pts.forEach(r => {
    const i = Math.min(Math.floor((r.energy-10)/18),4)
    r.offload===1 ? cloudBins[i]++ : localBins[i]++
  })
  new Chart(document.getElementById('chart-energy-offload'), {
    type:'bar',
    data:{
      labels:['10–28','28–46','46–64','64–82','82–100'],
      datasets:[
        { label:'Cloud Offload', data:cloudBins, backgroundColor:C.blue+'33', borderColor:C.blue, borderWidth:1.5, borderRadius:5 },
        { label:'Local Process', data:localBins, backgroundColor:C.amber+'33', borderColor:C.amber, borderWidth:1.5, borderRadius:5 }
      ]
    },
    options: { ...baseOpts('Energy Range (kWh)','Count'), plugins:{ ...baseOpts().plugins, legend:legendOpts() } }
  })
}
