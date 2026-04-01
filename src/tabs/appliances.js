import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

const C = { blue:'#2563EB',green:'#22C55E',amber:'#F59E0B',red:'#EF4444',purple:'#8B5CF6',cyan:'#06B6D4',orange:'#F97316',text:'#64748B',grid:'#F1F5F9' }
const PALETTE = [C.blue,C.green,C.amber,C.red,C.purple]

function baseOpts(xLabel='',yLabel='') {
  return {
    responsive:true, maintainAspectRatio:false,
    plugins:{
      legend:{display:false},
      tooltip:{ backgroundColor:'#0F172A',titleColor:'#F8FAFC',bodyColor:'#CBD5E1',borderColor:'#334155',borderWidth:1,padding:10,cornerRadius:8,
        titleFont:{family:'IBM Plex Sans',size:12,weight:'600'},bodyFont:{family:'Inter',size:12} }
    },
    scales:{
      x:{ title:{display:!!xLabel,text:xLabel,color:C.text,font:{family:'Inter',size:11}},grid:{color:C.grid},ticks:{color:C.text,font:{family:'Inter',size:11}} },
      y:{ title:{display:!!yLabel,text:yLabel,color:C.text,font:{family:'Inter',size:11}},grid:{color:C.grid},ticks:{color:C.text,font:{family:'Inter',size:11}} }
    }
  }
}

export function renderAppliances(panel, data) {
  const s = data.summary, sample = data.sample, total = s.totalRecords
  const apps    = ['Television','Dryer','Oven','Refrigerator','Microwave']
  const appKeys = ['tv','dryer','oven','fridge','micro']
  const emojis  = ['📺','🌀','🍳','❄️','📡']
  const counts  = apps.map(a=>s.applianceCounts[a])

  const combos = (() => {
    const map = {}
    sample.forEach(r=>{
      const k=[r.tv?'TV':'',r.dryer?'Dryer':'',r.oven?'Oven':'',r.fridge?'Fridge':'',r.micro?'Micro':''].filter(Boolean).join(' + ')||'None'
      map[k]=(map[k]||0)+1
    })
    return Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,8)
  })()

  const avgE = appKeys.map(k => {
    const on=sample.filter(r=>r[k]===1).map(r=>r.energy)
    const off=sample.filter(r=>r[k]===0).map(r=>r.energy)
    return {
      on: on.length?(on.reduce((a,b)=>a+b,0)/on.length).toFixed(2):0,
      off:off.length?(off.reduce((a,b)=>a+b,0)/off.length).toFixed(2):0
    }
  })

  panel.innerHTML = `
    <div class="page-header">
      <div class="page-title">Appliance Analytics</div>
      <div class="page-desc">Usage rates, energy consumption per device, and co-occurrence patterns</div>
    </div>

    <!-- KPI Cards -->
    <div class="kpi-grid">
      ${apps.map((a,i)=>`
        <div class="kpi-card" style="--kpi-color:${PALETTE[i]};--kpi-bg:${PALETTE[i]}18">
          <div class="kpi-top">
            <div class="kpi-icon-wrap" style="background:${PALETTE[i]}18">${emojis[i]}</div>
            <div class="kpi-badge" style="background:${PALETTE[i]}18;color:${PALETTE[i]};border:1px solid ${PALETTE[i]}33">
              ${((counts[i]/total)*100).toFixed(1)}%
            </div>
          </div>
          <div class="kpi-value" style="color:${PALETTE[i]}">${counts[i].toLocaleString()}</div>
          <div class="kpi-label">${a} — Active Records</div>
          <div class="kpi-sub">Usage rate: ${((counts[i]/total)*100).toFixed(1)}%</div>
        </div>
      `).join('')}
    </div>

    <div class="section-sep"><div class="section-sep-line"></div><div class="section-sep-label">Usage & Consumption Charts</div><div class="section-sep-line"></div></div>

    <div class="chart-grid chart-grid-2">
      <div class="chart-card">
        <div class="chart-header">
          <div class="chart-header-left">
            <div class="chart-title">Appliance Usage Rates — Radar</div>
            <div class="chart-subtitle">Relative frequency of active states per device</div>
          </div>
          <span class="chart-badge">Radar</span>
        </div>
        <div class="chart-container"><canvas id="chart-app-radar"></canvas></div>
      </div>
      <div class="chart-card">
        <div class="chart-header">
          <div class="chart-header-left">
            <div class="chart-title">Top Appliance Combinations</div>
            <div class="chart-subtitle">Most frequent co-occurring device sets</div>
          </div>
          <span class="chart-badge">Horizontal Bar</span>
        </div>
        <div class="chart-container"><canvas id="chart-combo-bar"></canvas></div>
      </div>
    </div>

    <div class="chart-grid chart-grid-2">
      <div class="chart-card">
        <div class="chart-header">
          <div class="chart-header-left">
            <div class="chart-title">Avg Energy — ON vs OFF State</div>
            <div class="chart-subtitle">Does device state affect energy consumption?</div>
          </div>
          <span class="chart-badge">Grouped Bar</span>
        </div>
        <div class="chart-container short"><canvas id="chart-app-energy"></canvas></div>
      </div>
      <div class="chart-card">
        <div class="chart-header">
          <div class="chart-header-left">
            <div class="chart-title">Appliance Share of Total Usage</div>
            <div class="chart-subtitle">Proportional contribution across all records</div>
          </div>
          <span class="chart-badge">Pie</span>
        </div>
        <div class="chart-container short"><canvas id="chart-app-pie"></canvas></div>
      </div>
    </div>

    <!-- Analysis Table -->
    <div class="analysis-grid">
      <div class="analysis-card">
        <div class="analysis-title">Appliance Usage Frequency</div>
        ${apps.map((a,i)=>`
          <div class="analysis-item">
            <span style="display:flex;align-items:center;gap:8px;min-width:130px">
              ${emojis[i]}
              <span style="font-weight:500">${a}</span>
            </span>
            <div class="analysis-bar-wrap">
              <div class="analysis-bar" style="width:${((counts[i]/total)*100).toFixed(1)}%;background:${PALETTE[i]}"></div>
            </div>
            <span style="font-weight:700;color:${PALETTE[i]};min-width:48px;text-align:right">${((counts[i]/total)*100).toFixed(1)}%</span>
          </div>
        `).join('')}
      </div>
      <div class="analysis-card">
        <div class="analysis-title">Key Findings</div>
        <div class="insight-box" style="margin:0">
          <strong>🏠 Appliance Insights:</strong><br><br>
          All five appliances show nearly identical usage rates of ~50%, ranging from
          <strong>${((Math.min(...counts)/total)*100).toFixed(1)}%</strong> to <strong>${((Math.max(...counts)/total)*100).toFixed(1)}%</strong>.
          This balanced distribution confirms that the dataset is synthetically generated with uniform appliance activation probabilities.<br><br>
          The <strong>Refrigerator</strong> records the highest activation at <strong>${((s.applianceCounts['Refrigerator']/total)*100).toFixed(1)}%</strong>,
          consistent with always-on operation. Average energy when devices are ON vs OFF shows minimal difference (~1–2 kWh),
          meaning overall household activity — not individual device states — drives energy consumption.
        </div>
      </div>
    </div>
  `

  // Radar
  new Chart(document.getElementById('chart-app-radar'),{
    type:'radar',
    data:{
      labels:apps,
      datasets:[{
        label:'Usage %', data:counts.map(c=>((c/total)*100).toFixed(2)),
        backgroundColor:'rgba(37,99,235,0.08)', borderColor:C.blue,
        borderWidth:2, pointBackgroundColor:PALETTE, pointRadius:6, pointHoverRadius:8
      }]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{display:false}, tooltip:{ backgroundColor:'#0F172A',titleColor:'#F8FAFC',bodyColor:'#CBD5E1',borderColor:'#334155',borderWidth:1,padding:10,cornerRadius:8 } },
      scales:{ r:{ min:48,max:52, grid:{color:'#E2E8F0'}, angleLines:{color:'#E2E8F0'},
        ticks:{color:C.text,font:{family:'Inter',size:10},backdropColor:'transparent'},
        pointLabels:{color:'#334155',font:{family:'IBM Plex Sans',size:12,weight:'600'}} } }
    }
  })

  // Combo
  new Chart(document.getElementById('chart-combo-bar'),{
    type:'bar',
    data:{
      labels:combos.map(c=>c[0].length>22?c[0].slice(0,20)+'…':c[0]),
      datasets:[{ label:'Count', data:combos.map(c=>c[1]),
        backgroundColor:combos.map((_,i)=>PALETTE[i%PALETTE.length]+'33'),
        borderColor:combos.map((_,i)=>PALETTE[i%PALETTE.length]),
        borderWidth:1.5, borderRadius:4 }]
    },
    options:{ ...baseOpts('Occurrences',''), indexAxis:'y' }
  })

  // ON/OFF energy
  new Chart(document.getElementById('chart-app-energy'),{
    type:'bar',
    data:{
      labels:apps.map((a,i)=>emojis[i]+' '+a.slice(0,5)),
      datasets:[
        { label:'Device ON', data:avgE.map(e=>e.on), backgroundColor:C.green+'33', borderColor:C.green, borderWidth:1.5, borderRadius:5 },
        { label:'Device OFF',data:avgE.map(e=>e.off), backgroundColor:C.amber+'33', borderColor:C.amber, borderWidth:1.5, borderRadius:5 }
      ]
    },
    options:{ ...baseOpts('','Avg Energy (kWh)'),
      plugins:{ ...baseOpts().plugins, legend:{display:true,labels:{color:C.text,font:{family:'Inter',size:12},padding:14,usePointStyle:true}} } }
  })

  // Pie
  new Chart(document.getElementById('chart-app-pie'),{
    type:'pie',
    data:{
      labels:apps.map((a,i)=>emojis[i]+' '+a),
      datasets:[{ data:counts, backgroundColor:PALETTE.map(c=>c+'cc'), borderColor:PALETTE, borderWidth:2, hoverOffset:6 }]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{
        legend:{position:'bottom',labels:{color:C.text,font:{family:'Inter',size:12},padding:12,usePointStyle:true}},
        tooltip:{ backgroundColor:'#0F172A',titleColor:'#F8FAFC',bodyColor:'#CBD5E1',borderColor:'#334155',borderWidth:1,padding:10,cornerRadius:8,
          callbacks:{ label:ctx=>` ${ctx.label}: ${((ctx.raw/total)*100).toFixed(1)}%` } }
      }
    }
  })
}
