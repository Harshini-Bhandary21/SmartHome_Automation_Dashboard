import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

const C = { blue:'#2563EB',green:'#22C55E',amber:'#F59E0B',red:'#EF4444',purple:'#8B5CF6',cyan:'#06B6D4',text:'#64748B',grid:'#F1F5F9' }

function baseOpts(xLabel='',yLabel='') {
  return {
    responsive:true, maintainAspectRatio:false,
    plugins:{
      legend:{display:false},
      tooltip:{ backgroundColor:'#0F172A',titleColor:'#F8FAFC',bodyColor:'#CBD5E1',borderColor:'#334155',borderWidth:1,padding:10,cornerRadius:8,
        titleFont:{family:'IBM Plex Sans',size:12,weight:'600'},bodyFont:{family:'Inter',size:12} }
    },
    scales:{
      x:{ title:{display:!!xLabel,text:xLabel,color:C.text,font:{family:'Inter',size:11}},grid:{color:C.grid},ticks:{color:C.text,font:{family:'Inter',size:11},maxTicksLimit:10} },
      y:{ title:{display:!!yLabel,text:yLabel,color:C.text,font:{family:'Inter',size:11}},grid:{color:C.grid},ticks:{color:C.text,font:{family:'Inter',size:11}} }
    }
  }
}

export function renderNetwork(panel, data) {
  const s = data.summary, sample = data.sample

  const bwBins=[...Array(10)].map(()=>0), bwLabels=[]
  for(let i=0;i<10;i++) bwLabels.push(`${i*5}K–${(i+1)*5}K`)
  const bwCloud=[...Array(10)].map(()=>0), bwLocal=[...Array(10)].map(()=>0)
  sample.forEach(r=>{
    const idx=Math.min(Math.floor(r.bw/5000),9)
    bwBins[idx]++
    r.offload===1?bwCloud[idx]++:bwLocal[idx]++
  })

  const timeBw=sample.slice(0,500).map(r=>r.bw/1000)
  const lineV=sample.slice(0,300).map(r=>r.lineV)
  const measV=sample.slice(0,300).map(r=>r.voltage)

  panel.innerHTML = `
    <div class="page-header">
      <div class="page-title">Network &amp; Offloading</div>
      <div class="page-desc">Bandwidth distribution, cloud vs local task allocation and voltage stability analysis</div>
    </div>

    <!-- KPIs -->
    <div class="kpi-grid">
      <div class="kpi-card" style="--kpi-color:${C.cyan};--kpi-bg:#ECFEFF">
        <div class="kpi-top"><div class="kpi-icon-wrap" style="background:#ECFEFF">📡</div>
          <div class="kpi-badge" style="background:#ECFEFF;color:${C.cyan};border:1px solid ${C.cyan}33">Avg</div>
        </div>
        <div class="kpi-value" style="color:${C.cyan}">${(s.avgBandwidth/1000).toFixed(1)}K</div>
        <div class="kpi-label">Avg Bandwidth (bps)</div>
        <div class="kpi-sub">Range: 2 – 48,970 bps</div>
      </div>
      <div class="kpi-card" style="--kpi-color:${C.blue};--kpi-bg:#EFF6FF">
        <div class="kpi-top"><div class="kpi-icon-wrap" style="background:#EFF6FF">☁️</div>
          <div class="kpi-badge">↑ ${((s.offload1/s.totalRecords)*100).toFixed(1)}%</div>
        </div>
        <div class="kpi-value">${s.offload1.toLocaleString()}</div>
        <div class="kpi-label">Cloud Offloads</div>
        <div class="kpi-sub">${((s.offload1/s.totalRecords)*100).toFixed(1)}% of all transactions</div>
      </div>
      <div class="kpi-card" style="--kpi-color:${C.amber};--kpi-bg:#FFFBEB">
        <div class="kpi-top"><div class="kpi-icon-wrap" style="background:#FFFBEB">🖥️</div>
          <div class="kpi-badge" style="background:#FFFBEB;color:${C.amber};border:1px solid ${C.amber}33">↓ ${((s.offload0/s.totalRecords)*100).toFixed(1)}%</div>
        </div>
        <div class="kpi-value" style="color:${C.amber}">${s.offload0.toLocaleString()}</div>
        <div class="kpi-label">Local Processes</div>
        <div class="kpi-sub">${((s.offload0/s.totalRecords)*100).toFixed(1)}% of all transactions</div>
      </div>
      <div class="kpi-card" style="--kpi-color:${C.green};--kpi-bg:#F0FDF4">
        <div class="kpi-top"><div class="kpi-icon-wrap" style="background:#F0FDF4">⚡</div>
          <div class="kpi-badge" style="background:#F0FDF4;color:${C.green};border:1px solid ${C.green}33">Stable</div>
        </div>
        <div class="kpi-value" style="color:${C.green}">232V</div>
        <div class="kpi-label">Avg Line Voltage</div>
        <div class="kpi-sub">Measured range: 220–239V</div>
      </div>
    </div>

    <div class="section-sep"><div class="section-sep-line"></div><div class="section-sep-label">Network Visualizations</div><div class="section-sep-line"></div></div>

    <div class="chart-grid chart-grid-2">
      <div class="chart-card">
        <div class="chart-header">
          <div class="chart-header-left">
            <div class="chart-title">Bandwidth Distribution</div>
            <div class="chart-subtitle">Frequency across 10 equal 5K-bps bins</div>
          </div>
          <span class="chart-badge">Histogram</span>
        </div>
        <div class="chart-container"><canvas id="chart-bw-hist"></canvas></div>
      </div>
      <div class="chart-card">
        <div class="chart-header">
          <div class="chart-header-left">
            <div class="chart-title">Offload Decision by Bandwidth</div>
            <div class="chart-subtitle">Cloud vs local across bandwidth ranges</div>
          </div>
          <span class="chart-badge">Stacked Bar</span>
        </div>
        <div class="chart-container"><canvas id="chart-offload-bw"></canvas></div>
      </div>
    </div>

    <div class="chart-grid chart-grid-2">
      <div class="chart-card">
        <div class="chart-header">
          <div class="chart-header-left">
            <div class="chart-title">Bandwidth Over Time</div>
            <div class="chart-subtitle">First 500 records — network fluctuation</div>
          </div>
          <span class="chart-badge">Timeline</span>
        </div>
        <div class="chart-container"><canvas id="chart-bw-time"></canvas></div>
      </div>
      <div class="chart-card">
        <div class="chart-header">
          <div class="chart-header-left">
            <div class="chart-title">Line Voltage vs Measured Voltage</div>
            <div class="chart-subtitle">Grid supply vs household measurement (300 records)</div>
          </div>
          <span class="chart-badge">Multi-Line</span>
        </div>
        <div class="chart-container"><canvas id="chart-voltage-compare"></canvas></div>
      </div>
    </div>

    <div class="insight-box">
      <strong>🌐 Network Analysis: </strong>
      Bandwidth is uniformly distributed from 2–48,970 bps (avg: <strong>${(s.avgBandwidth/1000).toFixed(1)}K bps</strong>), simulating realistic IoT scenarios from congested to uncongested networks.
      Cloud offloading occurs in <strong>${((s.offload1/s.totalRecords)*100).toFixed(1)}%</strong> of cases — remarkably consistent across all bandwidth ranges, suggesting the offload decision is multi-factorial rather than purely bandwidth-driven.
      Voltage remains stable between <strong>220–239V</strong>, with line voltage consistently 5–8V above measured voltage — confirming normal resistive losses in domestic wiring consistent with IEC standards.
    </div>
  `

  // BW histogram
  new Chart(document.getElementById('chart-bw-hist'),{
    type:'bar',
    data:{ labels:bwLabels,
      datasets:[{ label:'Records',data:bwBins,
        backgroundColor:C.cyan+'33',borderColor:C.cyan,borderWidth:1.5,borderRadius:4 }]
    },
    options:baseOpts('Bandwidth Range','Count')
  })

  // Offload stacked
  new Chart(document.getElementById('chart-offload-bw'),{
    type:'bar',
    data:{ labels:bwLabels,
      datasets:[
        { label:'Cloud Offload',data:bwCloud,backgroundColor:C.blue+'44',borderColor:C.blue,borderWidth:1.5,borderRadius:[4,4,0,0] },
        { label:'Local Process',data:bwLocal,backgroundColor:C.amber+'44',borderColor:C.amber,borderWidth:1.5,borderRadius:[4,4,0,0] }
      ]
    },
    options:{
      responsive:true,maintainAspectRatio:false,
      plugins:{ legend:{display:true,labels:{color:C.text,font:{family:'Inter',size:12},padding:14,usePointStyle:true}},
        tooltip:{ backgroundColor:'#0F172A',titleColor:'#F8FAFC',bodyColor:'#CBD5E1',borderColor:'#334155',borderWidth:1,padding:10,cornerRadius:8 } },
      scales:{
        x:{ stacked:true,title:{display:true,text:'Bandwidth Range',color:C.text,font:{family:'Inter',size:11}},grid:{color:C.grid},ticks:{color:C.text,font:{family:'Inter',size:10}} },
        y:{ stacked:true,title:{display:true,text:'Count',color:C.text,font:{family:'Inter',size:11}},grid:{color:C.grid},ticks:{color:C.text,font:{family:'Inter',size:11}} }
      }
    }
  })

  // BW timeline
  new Chart(document.getElementById('chart-bw-time'),{
    type:'line',
    data:{ labels:timeBw.map((_,i)=>i),
      datasets:[{ label:'Bandwidth (Kbps)',data:timeBw,borderColor:C.purple,backgroundColor:'rgba(139,92,246,0.06)',borderWidth:1.5,pointRadius:0,fill:true,tension:0.3 }]
    },
    options:baseOpts('Record Index','Bandwidth (Kbps)')
  })

  // Voltage comparison
  new Chart(document.getElementById('chart-voltage-compare'),{
    type:'line',
    data:{ labels:lineV.map((_,i)=>i),
      datasets:[
        { label:'Line Voltage (V)',data:lineV,borderColor:C.green,backgroundColor:'transparent',borderWidth:1.5,pointRadius:0,tension:0.3 },
        { label:'Measured Voltage (V)',data:measV,borderColor:C.blue,backgroundColor:'transparent',borderWidth:1.5,pointRadius:0,tension:0.3 }
      ]
    },
    options:{
      responsive:true,maintainAspectRatio:false,
      plugins:{ legend:{display:true,labels:{color:C.text,font:{family:'Inter',size:12},padding:14,usePointStyle:true}},
        tooltip:{ backgroundColor:'#0F172A',titleColor:'#F8FAFC',bodyColor:'#CBD5E1',borderColor:'#334155',borderWidth:1,padding:10,cornerRadius:8 } },
      scales:{
        x:{ title:{display:true,text:'Record Index',color:C.text,font:{family:'Inter',size:11}},grid:{color:C.grid},ticks:{color:C.text,font:{family:'Inter',size:11},maxTicksLimit:8} },
        y:{ title:{display:true,text:'Voltage (V)',color:C.text,font:{family:'Inter',size:11}},grid:{color:C.grid},ticks:{color:C.text,font:{family:'Inter',size:11}} }
      }
    }
  })
}
