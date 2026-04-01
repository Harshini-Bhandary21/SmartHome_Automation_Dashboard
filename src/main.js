import './style.css'
import data from './data/dataset.json'
import { renderOverview }   from './tabs/overview.js'
import { renderEnergy }     from './tabs/energy.js'
import { renderAppliances } from './tabs/appliances.js'
import { renderNetwork }    from './tabs/network.js'
import { renderData }       from './tabs/dataTable.js'
import { renderReport }     from './tabs/report.js'

const today = new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })

document.querySelector('#app').innerHTML = `
  <!-- Loading Overlay -->
  <div id="loading-overlay">
    <div class="loading-logo">
      <div class="loading-logo-icon">🏠</div>
      <div class="loading-logo-text">IoT Analytics</div>
    </div>
    <div style="text-align:center;display:flex;flex-direction:column;gap:8px;align-items:center">
      <div class="loading-bar-wrap"><div class="loading-bar"></div></div>
      <div class="loading-text">Loading ${data.summary.totalRecords.toLocaleString()} records…</div>
    </div>
  </div>

  <!-- Header -->
  <header class="dashboard-header">
    <div class="header-left">
      <div class="logo-icon">🏠</div>
      <div>
        <div class="header-title">SmartHome IoT Analytics</div>
        <div class="header-subtitle">Energy &amp; Network Dashboard</div>
      </div>
      <div class="header-divider"></div>
      <div class="header-meta">
        <div class="header-meta-dot"></div>
        <span>${today} &nbsp;·&nbsp; ${data.summary.totalRecords.toLocaleString()} records &nbsp;·&nbsp; Practical Assignment-3</span>
      </div>
    </div>
    <div class="header-right">
      <div class="live-badge">
        <div class="live-dot"></div>
        Live Analysis
      </div>
      <button class="btn-export" id="btn-quick-pdf">
        ↓ Export PDF
      </button>
    </div>
  </header>

  <!-- Nav Tabs -->
  <nav class="nav-tabs">
    <button class="nav-tab active" data-tab="overview">📊 Overview</button>
    <button class="nav-tab" data-tab="energy">⚡ Energy Analysis</button>
    <button class="nav-tab" data-tab="appliances">🏠 Appliances</button>
    <button class="nav-tab" data-tab="network">🌐 Network &amp; Offloading</button>
    <button class="nav-tab" data-tab="data">🗄 Raw Data</button>
    <button class="nav-tab" data-tab="report">📄 Report</button>
  </nav>

  <!-- Main -->
  <main class="main-content">
    <div id="tab-overview"   class="tab-panel active"></div>
    <div id="tab-energy"     class="tab-panel"></div>
    <div id="tab-appliances" class="tab-panel"></div>
    <div id="tab-network"    class="tab-panel"></div>
    <div id="tab-data"       class="tab-panel"></div>
    <div id="tab-report"     class="tab-panel"></div>
  </main>
`

// ===== TAB SWITCHING =====
const tabs    = document.querySelectorAll('.nav-tab')
const panels  = document.querySelectorAll('.tab-panel')
const rendered = new Set()

function activateTab(name) {
  tabs.forEach(t   => t.classList.toggle('active', t.dataset.tab === name))
  panels.forEach(p => {
    const on = p.id === `tab-${name}`
    p.classList.toggle('active', on)
    if (on) p.classList.add('fade-in')
  })
  if (!rendered.has(name)) {
    rendered.add(name)
    const el = document.getElementById(`tab-${name}`)
    if (name === 'energy')     renderEnergy(el, data)
    if (name === 'appliances') renderAppliances(el, data)
    if (name === 'network')    renderNetwork(el, data)
    if (name === 'data')       renderData(el, data)
    if (name === 'report')     renderReport(el, data)
  }
}

tabs.forEach(t => t.addEventListener('click', () => activateTab(t.dataset.tab)))

// ===== BOOT =====
setTimeout(() => {
  const ov = document.getElementById('loading-overlay')
  ov.style.opacity = '0'
  setTimeout(() => ov.remove(), 400)
  rendered.add('overview')
  renderOverview(document.getElementById('tab-overview'), data)

  document.getElementById('btn-quick-pdf').addEventListener('click', () => {
    activateTab('report')
    setTimeout(() => document.getElementById('btn-generate-pdf')?.click(), 300)
  })
}, 1800)
