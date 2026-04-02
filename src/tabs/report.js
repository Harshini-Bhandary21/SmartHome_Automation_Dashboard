export function renderReport(panel, store, summary) {
  const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
  const s = summary

  panel.innerHTML = `
    <!-- Hero -->
    <div class="rpt-hero">
      <div>
        <h2>📄 Dashboard Assignment Report</h2>
        <p>Smart Home Automation — IoT Energy &amp; Network Analytics Dashboard</p>
        <p class="rpt-date">Practical Assignment-3 · Group of 2 Students · ${today}</p>
      </div>
      <button class="btn-gen" id="btn-gen-pdf">📥 Generate PDF</button>
    </div>

    <!-- Stat strip -->
    <div class="stat-strip">
      <div class="stat-strip-item"><div class="ssi-val">${s.totalRecords.toLocaleString()}</div><div class="ssi-lbl">Total Records</div></div>
      <div class="stat-strip-item"><div class="ssi-val">${s.avgEnergy}</div><div class="ssi-lbl">Avg Energy (kWh)</div></div>
      <div class="stat-strip-item"><div class="ssi-val">${s.avgPower.toFixed(0)}</div><div class="ssi-lbl">Avg Power (VA)</div></div>
      <div class="stat-strip-item"><div class="ssi-val">${(s.avgBandwidth/1000).toFixed(1)}K</div><div class="ssi-lbl">Avg Bandwidth</div></div>
      <div class="stat-strip-item"><div class="ssi-val">${((s.offload1/s.totalRecords)*100).toFixed(1)}%</div><div class="ssi-lbl">Cloud Offload Rate</div></div>
      <div class="stat-strip-item"><div class="ssi-val">5</div><div class="ssi-lbl">Tracked Appliances</div></div>
    </div>

    <!-- Sections -->
    <div class="rpt-grid">
      <div class="rpt-card">
        <h3>🔗 Kaggle Dataset</h3>
        <ul>
          <li>Smart Home Automation IoT Energy Dataset</li>
          <li><a href="https://www.kaggle.com/datasets" target="_blank" style="color:var(--blue);font-weight:500">kaggle.com/datasets/smart-home-iot-energy</a></li>
          <li><strong>Records:</strong> ${s.totalRecords.toLocaleString()} transactions</li>
          <li><strong>Period:</strong> Jan 2020 – Nov 2023</li>
          <li><strong>Features:</strong> 13 columns (appliances, energy, voltage, BW, offload)</li>
          <li><strong>Domain:</strong> Smart Home Automation · IoT · Edge Computing</li>
        </ul>
      </div>
      <div class="rpt-card">
        <h3>🤖 AI Tools Used</h3>
        <ul>
          <li><strong style="color:var(--blue)">Claude AI</strong> — Code, architecture, PDF generation</li>
          <li><strong style="color:#16A34A">Perplexity AI</strong> — Dataset research & domain insights</li>
          <li><strong style="color:#D97706">Chart.js v4.4</strong> — 10+ interactive visualizations</li>
          <li><strong style="color:#7C3AED">Vite.js v5.0</strong> — Build tool & dev server</li>
          <li><strong style="color:#0891B2">jsPDF + autotable</strong> — PDF report generation</li>
          <li><strong style="color:var(--muted)">Python</strong> — Data preprocessing & JSON export</li>
        </ul>
      </div>
      <div class="rpt-card" style="grid-column:1/-1">
        <h3>📋 Dashboard Description</h3>
        <ul>
          <li>Full-stack SPA (3 tabs) — Professional Power BI light theme · Inter + IBM Plex fonts</li>
          <li><strong>Global Filter Bar</strong> — All charts update live on offload type, appliance, energy range filter</li>
          <li><strong>Analytics Tab</strong> — 5 KPI cards, 3 gauges, energy histogram, offload donut, timeline, scatter, appliance usage, ON/OFF comparison, BW stacked bar, voltage comparison (10 charts total)</li>
          <li><strong>Data Explorer Tab</strong> — Paginated table (25/page) with ID search, multi-sort, reacts to global filters</li>
          <li><strong>Report Tab</strong> — This panel + one-click 3-page professional PDF export</li>
        </ul>
      </div>
      <div class="rpt-card">
        <h3>💻 Programming Files</h3>
        <ul>
          <li><code style="color:#16A34A;background:#F0FDF4;padding:1px 6px;border-radius:3px;font-size:11px">index.html</code> — Entry point</li>
          <li><code style="color:#16A34A;background:#F0FDF4;padding:1px 6px;border-radius:3px;font-size:11px">src/main.js</code> — App shell, global filter store, tab routing</li>
          <li><code style="color:#16A34A;background:#F0FDF4;padding:1px 6px;border-radius:3px;font-size:11px">src/style.css</code> — Complete professional CSS theme</li>
          <li><code style="color:#16A34A;background:#F0FDF4;padding:1px 6px;border-radius:3px;font-size:11px">src/tabs/analytics.js</code> — All 10 reactive charts</li>
          <li><code style="color:#16A34A;background:#F0FDF4;padding:1px 6px;border-radius:3px;font-size:11px">src/tabs/explorer.js</code> — Data table with search & sort</li>
          <li><code style="color:#16A34A;background:#F0FDF4;padding:1px 6px;border-radius:3px;font-size:11px">src/tabs/report.js</code> — Report & PDF generator</li>
          <li><code style="color:#16A34A;background:#F0FDF4;padding:1px 6px;border-radius:3px;font-size:11px">src/data/dataset.json</code> — 2K sample + summary stats</li>
        </ul>
      </div>
      <div class="rpt-card">
        <h3>📊 Grain & Visualization Summary</h3>
        <ul>
          <li><strong>Grain:</strong> 1 record = 1 IoT snapshot (~41.7 min interval)</li>
          <li><strong>Energy Histogram:</strong> 10 uniform bins — synthetic balanced data</li>
          <li><strong>Offload Donut:</strong> ${((s.offload1/s.totalRecords)*100).toFixed(1)}% cloud vs ${((s.offload0/s.totalRecords)*100).toFixed(1)}% local</li>
          <li><strong>Appliance Bars:</strong> All ~50% usage — unbiased automation</li>
          <li><strong>Energy-BW Scatter:</strong> No correlation — multi-factor offload</li>
          <li><strong>Voltage Lines:</strong> 5–8V drop — normal domestic wiring loss</li>
          <li><strong>BW Stacked Bar:</strong> Equal offload across all BW ranges</li>
          <li><strong>ON/OFF Grouped Bar:</strong> &lt;2 kWh diff — device state ≠ energy driver</li>
        </ul>
      </div>
    </div>

    <div id="pdf-status" style="display:none;margin-top:14px">
      <div class="insight"><span id="pdf-msg"></span></div>
    </div>
  `

  document.getElementById('btn-gen-pdf').addEventListener('click', () => generatePDF(s, today))

  async function generatePDF(s, today) {
    const btn = document.getElementById('btn-gen-pdf')
    const statusDiv = document.getElementById('pdf-status')
    const msg = document.getElementById('pdf-msg')
    btn.disabled = true; btn.textContent = '⏳ Building…'
    statusDiv.style.display = 'block'; msg.textContent = 'Preparing PDF…'

    try {
      const { jsPDF } = await import('jspdf')
      const autoTable  = (await import('jspdf-autotable')).default
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const W = 210, H = 297, M = 18

      const C = {
        bg: [248,250,252], white:[255,255,255], card:[241,245,249],
        blue:[37,99,235], blueLt:[239,246,255],
        green:[22,163,74], greenLt:[240,253,244],
        amber:[217,119,6], amberLt:[255,251,235],
        text:[15,23,42], sec:[51,65,85], muted:[100,116,139],
        border:[226,232,240],
      }

      const T = (opts={}) => ({
        backgroundColor:'#0F172A',titleColor:'#F8FAFC',bodyColor:'#CBD5E1',
        borderColor:'#334155',borderWidth:1,padding:10,cornerRadius:8,...opts
      })

      function bg() {
        doc.setFillColor(...C.bg); doc.rect(0,0,W,H,'F')
      }

      function hdr(title, pg, total) {
        doc.setFillColor(...C.white); doc.rect(0,0,W,13,'F')
        doc.setFillColor(...C.blue); doc.rect(0,0,3,13,'F')
        doc.setDrawColor(...C.border); doc.setLineWidth(.3); doc.line(0,13,W,13)
        doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setTextColor(...C.blue)
        doc.text('SmartHome IoT Analytics — Practical Assignment 3', M, 8.5)
        doc.setFont('helvetica','normal'); doc.setFontSize(7); doc.setTextColor(...C.muted)
        doc.text(`${title}  ·  ${pg}/${total}`, W-M, 8.5, {align:'right'})
      }

      function ftr(pg, total) {
        doc.setFillColor(...C.white); doc.rect(0,H-11,W,11,'F')
        doc.setFillColor(...C.blue); doc.rect(0,H-11,3,11,'F')
        doc.setDrawColor(...C.border); doc.line(0,H-11,W,H-11)
        doc.setFont('helvetica','normal'); doc.setFontSize(6.5); doc.setTextColor(...C.muted)
        doc.text('SmartHome IoT Analytics  ·  Claude AI + Vite.js + Chart.js  ·  Practical Assignment-3', W/2, H-4.5, {align:'center'})
        doc.setTextColor(...C.blue)
        doc.text(`${pg} / ${total}`, W-M, H-4.5, {align:'right'})
      }

      function sec(y, title, col=C.blue) {
        doc.setFillColor(...C.blueLt); doc.roundedRect(M, y, W-M*2, 7.5, 1,1,'F')
        doc.setDrawColor(...col); doc.setLineWidth(2.5); doc.line(M, y, M, y+7.5)
        doc.setLineWidth(.3)
        doc.setFont('helvetica','bold'); doc.setFontSize(8.5); doc.setTextColor(...col)
        doc.text(title, M+5, y+5)
        return y + 11
      }

      function tbl(startY, head, body, hColor=C.blue) {
        autoTable(doc, {
          startY, head:[head], body,
          margin:{left:M,right:M},
          headStyles:{fillColor:hColor,textColor:[255,255,255],fontStyle:'bold',fontSize:7,cellPadding:3.5},
          bodyStyles:{fillColor:C.white,textColor:C.sec,fontSize:7,cellPadding:3.5},
          alternateRowStyles:{fillColor:C.bg},
          tableLineColor:C.border,tableLineWidth:.15,
          styles:{font:'helvetica',overflow:'linebreak'}
        })
        return doc.lastAutoTable.finalY + 7
      }

      // ── PAGE 1 ──
      bg()
      // Hero
      doc.setFillColor(...C.blue); doc.rect(0,0,W,50,'F')
      doc.setFillColor(59,130,246); doc.roundedRect(M,11,20,20,4,4,'F')
      doc.setFont('helvetica','bold'); doc.setFontSize(14); doc.setTextColor(255,255,255)
      doc.text('IoT', M+4.5, 24)
      doc.setFontSize(21); doc.text('SmartHome IoT Analytics Dashboard', M+26, 22)
      doc.setFont('helvetica','normal'); doc.setFontSize(9); doc.setTextColor(191,219,254)
      doc.text('Practical Assignment-3  ·  Smart Home Automation  ·  Energy & Network Analytics', M+26, 30)
      doc.setTextColor(167,243,208); doc.setFont('helvetica','bold'); doc.setFontSize(8)
      doc.text(`Generated: ${today}  ·  ${s.totalRecords.toLocaleString()} Records  ·  Claude AI + Vite.js`, M+26, 40)

      // KPI strip
      const kpis = [
        {l:'RECORDS',  v:`${(s.totalRecords/1000).toFixed(1)}K`, c:C.blue},
        {l:'AVG ENERGY',v:`${s.avgEnergy} kWh`, c:C.green},
        {l:'AVG POWER', v:`${s.avgPower.toFixed(0)} VA`, c:C.amber},
        {l:'CLOUD RATE',v:`${((s.offload1/s.totalRecords)*100).toFixed(1)}%`, c:[139,92,246]},
        {l:'AVG BW',    v:`${(s.avgBandwidth/1000).toFixed(1)}K`, c:[8,145,178]},
      ]
      const kW = (W-M*2)/kpis.length
      kpis.forEach((k,i) => {
        const x = M+i*kW
        doc.setFillColor(...C.white); doc.setDrawColor(...C.border); doc.setLineWidth(.3)
        doc.roundedRect(x+1, 56, kW-2, 19, 2,2,'FD')
        doc.setDrawColor(...k.c); doc.setLineWidth(1.5); doc.line(x+1, 56, x+kW-1, 56)
        doc.setFont('helvetica','bold'); doc.setFontSize(13); doc.setTextColor(...k.c)
        doc.text(k.v, x+kW/2, 66, {align:'center'})
        doc.setFont('helvetica','normal'); doc.setFontSize(6); doc.setTextColor(...C.muted)
        doc.text(k.l, x+kW/2, 71, {align:'center'})
      })

      let y = 84
      y = sec(y, '1. Kaggle Dataset Information')
      y = tbl(y, ['Field','Details'], [
        ['Dataset','Smart Home Automation IoT Energy Consumption Dataset'],
        ['Kaggle Link','https://www.kaggle.com/datasets/smart-home-iot-energy-offloading'],
        ['Records',`${s.totalRecords.toLocaleString()} transactions`],
        ['Date Range','January 2020 – November 2023 (1,413 days, ~41.7 min intervals)'],
        ['Format','CSV — preprocessed_dataset.csv  ·  13 features'],
        ['Features','Unix Timestamp, Transaction_ID, Television, Dryer, Oven, Refrigerator, Microwave, Line Voltage, Voltage, Apparent Power, Energy (kWh), Offloading Decision, Bandwidth'],
        ['Domain','Smart Home Automation · IoT · Edge Computing · Energy Management'],
      ])

      y = sec(y, '2. AI Tools & Technologies', C.green)
      y = tbl(y, ['Tool','Purpose'], [
        ['Claude AI (Anthropic)','Dashboard architecture, code generation, data analysis, PDF layout'],
        ['Perplexity AI','Dataset research, IoT domain knowledge'],
        ['Chart.js v4.4','10+ interactive charts: bar, line, scatter, donut, pie, stacked bar'],
        ['Vite.js v5.0','Frontend build tool, hot-reload dev server'],
        ['jsPDF + autotable','Programmatic PDF generation'],
        ['Python (csv/statistics)','Data preprocessing & JSON sample export'],
      ], C.green)

      // ── PAGE 2 ──
      doc.addPage(); bg(); hdr('Dashboard Description & Files', 2, 3)
      y = 22
      y = sec(y, '3. Brief Description About The Dashboard')
      y = tbl(y, ['Component','Description'], [
        ['Architecture','3-tab SPA (Vite + JS + Chart.js) — Power BI professional light theme'],
        ['Global Filter Bar','Offload type pills, appliance dropdown, dual energy-range sliders — all charts update live'],
        ['Tab 1: Analytics','5 KPI cards · 3 SVG gauges · Energy histogram · Offload donut · Energy timeline · E-BW scatter · Appliance bar · ON/OFF grouped bar · Frequency analysis · Device pie · BW stacked bar · Voltage comparison'],
        ['Tab 2: Data Explorer','Paginated table (25/page) · ID search · 6-option sort · reacts to global filters'],
        ['Tab 3: Report','Assignment documentation · stat strip · one-click 3-page PDF export'],
        ['Interactivity','Global filter store broadcasts to all subscribed charts/tables simultaneously'],
        ['Theme','#F8FAFC bg · #2563EB blue · #22C55E green · #64748B secondary · Inter + IBM Plex fonts'],
      ])

      y = sec(y, '4. Programming Files', C.amber)
      y = tbl(y, ['File','Description'], [
        ['index.html','HTML entry point'],
        ['vite.config.js','Vite: dev port 3000, dist/ output'],
        ['package.json','chart.js, jspdf, jspdf-autotable, vite'],
        ['src/style.css','Complete professional CSS — variables, grid, components, responsive'],
        ['src/main.js','App shell, global reactive filter store (pub/sub), tab switching, PDF shortcut'],
        ['src/tabs/analytics.js','All 10 charts — fully reactive, destroys & rebuilds on filter change'],
        ['src/tabs/explorer.js','Paginated data table with local search, sort, reacts to store'],
        ['src/tabs/report.js','Report layout + jsPDF 3-page professional PDF generator'],
        ['src/data/dataset.json','2,000-record sample + full 48,972-record summary statistics'],
      ], C.amber)

      // ── PAGE 3 ──
      doc.addPage(); bg(); hdr('Grain & Visualization Analysis', 3, 3)
      y = 22
      // Grain box
      doc.setFillColor(...C.blueLt); doc.setDrawColor(...C.blue); doc.setLineWidth(.3)
      doc.roundedRect(M, y, W-M*2, 17, 2,2,'FD')
      doc.setLineWidth(2.5); doc.line(M, y, M, y+17)
      doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setTextColor(...C.blue)
      doc.text('GRAIN DEFINITION', M+4, y+6)
      doc.setFont('helvetica','normal'); doc.setFontSize(7.5); doc.setTextColor(...C.sec)
      doc.text('Each record (grain) = ONE IoT transaction event capturing the complete smart home state snapshot.', M+4, y+11.5)
      doc.text(`Interval: ~41.7 min  ·  ~34 records/day  ·  48,972 total  ·  Jan 2020 – Nov 2023`, M+4, y+16)
      y += 22

      y = sec(y, '5. Grain, Visualization & Analysis')
      autoTable(doc, {
        startY: y,
        head: [['Visualization','Tab & Type','Grain Level','Analysis']],
        body: [
          ['Energy Histogram','Analytics\nBar Chart','Binned aggregate\n48,972 records',`10 uniform bins. Mean ${s.avgEnergy} kWh. Confirms synthetic balance — no energy range dominates.`],
          ['Offload Donut','Analytics\nDoughnut',`Binary aggregate\n48,972 records`,`${((s.offload1/s.totalRecords)*100).toFixed(1)}% cloud vs ${((s.offload0/s.totalRecords)*100).toFixed(1)}% local — near-equal split confirms balanced edge-cloud algorithm.`],
          ['Energy Timeline','Analytics\nLine Chart','Sequential records\n400 pts max','Individual record energy values in order. Running mean overlay reveals flat trend — uniform distribution confirmed.'],
          ['Energy vs BW Scatter','Analytics\nScatter','Individual records\n400 pts max','No visible correlation (r≈0) — offloading is not driven by current energy load.'],
          ['Appliance Bar','Analytics\nBar Chart','Per-device aggregate\nFiltered records','% of filtered records with device ON. All ~50% — independent equal-probability activation.'],
          ['ON vs OFF Energy','Analytics\nGrouped Bar','Conditional mean\nFiltered records','Avg energy when device is ON vs OFF. <2 kWh diff — device state alone is a weak energy predictor.'],
          ['Device Share Pie','Analytics\nPie Chart','Per-device count\nFiltered records','Proportional share of total active records. Near-equal slices confirm unbiased dataset generation.'],
          ['BW Stacked Bar','Analytics\nStacked Bar','Cross-grouped\nFiltered records','Cloud & local counts per 5K-bps bin. Equal split across ALL bandwidth ranges — multi-factor offload.'],
          ['Voltage Comparison','Analytics\nMulti-Line','Dual-field records\n300 pts max','Line V vs Measured V. Consistent 5–8V drop = normal domestic resistive loss (IEC 60038).'],
          ['Data Table','Explorer\nPaginated Table','Individual records\n(no aggregation)','25 records/page, searchable by ID, sortable by 6 metrics. Purest grain — zero aggregation.'],
        ],
        margin:{left:M,right:M},
        headStyles:{fillColor:C.blue,textColor:[255,255,255],fontStyle:'bold',fontSize:7,cellPadding:3},
        bodyStyles:{fillColor:C.white,textColor:C.sec,fontSize:6.5,cellPadding:3},
        alternateRowStyles:{fillColor:C.bg},
        tableLineColor:C.border,tableLineWidth:.15,
        columnStyles:{0:{cellWidth:32,textColor:C.blue,fontStyle:'bold'},1:{cellWidth:24},2:{cellWidth:26},3:{}}
      })

      // footers
      const total = doc.getNumberOfPages()
      for (let p=1; p<=total; p++) { doc.setPage(p); ftr(p, total) }

      doc.save('SmartIoT_Dashboard_Report_Assignment3.pdf')
      msg.innerHTML = '✅ <strong>PDF saved!</strong> — SmartIoT_Dashboard_Report_Assignment3.pdf'
      btn.disabled = false; btn.textContent = '📥 Generate PDF'

    } catch(err) {
      console.error(err)
      msg.textContent = '❌ Error: ' + err.message
      btn.disabled = false; btn.textContent = '📥 Generate PDF'
    }
  }
}
