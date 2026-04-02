import './style.css'
import rawData from './data/dataset.json'
import { renderAnalytics } from './tabs/analytics.js'
import { renderDataExplorer } from './tabs/explorer.js'
import { renderReport } from './tabs/report.js'

/* ═══════════════════════════════════════════
   GLOBAL FILTER STATE  (reactive store)
═══════════════════════════════════════════ */
export const store = {
  offload: 'all',        // 'all' | '0' | '1'
  appliance: 'all',      // 'all' | 'tv' | 'dryer' | 'oven' | 'fridge' | 'micro'
  energyMin: 10,         // number
  energyMax: 100,
  listeners: [],
  subscribe(fn) { this.listeners.push(fn) },
  notify()      { this.listeners.forEach(fn => fn(this.filtered())) },
  filtered() {
    return rawData.sample.filter(r => {
      if (this.offload !== 'all' && r.offload !== +this.offload) return false
      if (this.appliance !== 'all' && !r[this.appliance]) return false
      if (r.energy < this.energyMin || r.energy > this.energyMax) return false
      return true
    })
  }
}

export const summary = rawData.summary

const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

/* ═══════════════════════════════════════════
   APP SHELL
═══════════════════════════════════════════ */
document.querySelector('#app').innerHTML = `
  <!-- Loader -->
  <div id="loader">
    <div class="loader-logo">
      <div class="loader-icon">🏠</div>
      <div class="loader-name">IoT Analytics</div>
    </div>
    <div class="loader-track"><div class="loader-fill"></div></div>
    <div class="loader-text">Loading ${rawData.summary.totalRecords.toLocaleString()} records…</div>
  </div>

  <!-- Header -->
  <header class="header">
    <div class="header-inner">
      <div class="h-logo">🏠</div>
      <div>
        <div class="h-title">SmartHome IoT Analytics</div>
        <div class="h-sub">Energy · Appliances · Network</div>
      </div>
      <div class="h-divider"></div>
      <div class="h-meta">
        <div class="h-dot"></div>
        <span>${today} · ${rawData.summary.totalRecords.toLocaleString()} records · Assignment-3</span>
      </div>
      <div class="h-spacer"></div>
      <button class="h-btn h-btn-outline" id="btn-reset-all">↺ Reset Filters</button>
      <button class="h-btn h-btn-solid" id="btn-pdf">↓ Export PDF</button>
    </div>
  </header>

  <!-- Global Filter Bar -->
  <div class="gfb">
    <span class="gfb-label">Filters</span>
    <div class="gfb-controls">

      <!-- Offload pills -->
      <button class="gfb-pill active" data-filter="offload" data-val="all">All Transactions</button>
      <button class="gfb-pill" data-filter="offload" data-val="1">☁ Cloud Offload</button>
      <button class="gfb-pill" data-filter="offload" data-val="0">🖥 Local Process</button>

      <div class="gfb-sep"></div>

      <!-- Appliance select -->
      <select class="gfb-select" id="gf-appliance">
        <option value="all">All Appliances</option>
        <option value="tv">📺 TV Active</option>
        <option value="dryer">🌀 Dryer Active</option>
        <option value="oven">🍳 Oven Active</option>
        <option value="fridge">❄️ Fridge Active</option>
        <option value="micro">📡 Microwave Active</option>
      </select>

      <div class="gfb-sep"></div>

      <!-- Energy range -->
      <span style="font-size:11px;font-weight:600;color:var(--muted)">Energy</span>
      <input type="range" class="gfb-range" id="gf-energy-min" min="10" max="100" step="5" value="10">
      <span class="gfb-range-val" id="gf-energy-min-val">10</span>
      <span style="font-size:11px;color:var(--faint)">–</span>
      <input type="range" class="gfb-range" id="gf-energy-max" min="10" max="100" step="5" value="100">
      <span class="gfb-range-val" id="gf-energy-max-val">100</span>
      <span style="font-size:10px;color:var(--faint)">kWh</span>

    </div>
    <span class="gfb-count" id="gf-count">Showing <span>${rawData.sample.length.toLocaleString()}</span> records</span>
    <button class="gfb-reset" id="gf-reset-btn">Reset</button>
  </div>

  <!-- Nav -->
  <nav class="nav">
    <button class="nav-tab active" data-tab="analytics">📊 Analytics</button>
    <button class="nav-tab" data-tab="explorer">🗄 Data Explorer</button>
    <button class="nav-tab" data-tab="report">📄 Report</button>
  </nav>

  <!-- Panels -->
  <main class="main">
    <div id="tab-analytics" class="tab-panel active"></div>
    <div id="tab-explorer"  class="tab-panel"></div>
    <div id="tab-report"    class="tab-panel"></div>
  </main>
`

/* ═══════════════════════════════════════════
   GLOBAL FILTER WIRING
═══════════════════════════════════════════ */
function updateCount(filtered) {
  const el = document.querySelector('#gf-count span')
  if (el) el.textContent = filtered.length.toLocaleString()
}

// Offload pills
document.querySelectorAll('[data-filter="offload"]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-filter="offload"]').forEach(b => b.classList.remove('active'))
    btn.classList.add('active')
    store.offload = btn.dataset.val
    store.notify()
    updateCount(store.filtered())
  })
})

// Appliance select
document.getElementById('gf-appliance').addEventListener('change', function () {
  store.appliance = this.value
  store.notify()
  updateCount(store.filtered())
})

// Energy sliders
document.getElementById('gf-energy-min').addEventListener('input', function () {
  const v = +this.value
  if (v > store.energyMax - 5) { this.value = store.energyMax - 5; return }
  store.energyMin = v
  document.getElementById('gf-energy-min-val').textContent = v
  store.notify()
  updateCount(store.filtered())
})
document.getElementById('gf-energy-max').addEventListener('input', function () {
  const v = +this.value
  if (v < store.energyMin + 5) { this.value = store.energyMin + 5; return }
  store.energyMax = v
  document.getElementById('gf-energy-max-val').textContent = v
  store.notify()
  updateCount(store.filtered())
})

function resetAllFilters() {
  store.offload = 'all'; store.appliance = 'all'
  store.energyMin = 10; store.energyMax = 100
  document.querySelectorAll('[data-filter="offload"]').forEach(b => b.classList.toggle('active', b.dataset.val === 'all'))
  document.getElementById('gf-appliance').value = 'all'
  document.getElementById('gf-energy-min').value = 10
  document.getElementById('gf-energy-max').value = 100
  document.getElementById('gf-energy-min-val').textContent = 10
  document.getElementById('gf-energy-max-val').textContent = 100
  store.notify()
  updateCount(store.filtered())
}

document.getElementById('gf-reset-btn').addEventListener('click', resetAllFilters)
document.getElementById('btn-reset-all').addEventListener('click', resetAllFilters)

/* ═══════════════════════════════════════════
   TAB SWITCHING
═══════════════════════════════════════════ */
const rendered = new Set()

function switchTab(name) {
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name))
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === `tab-${name}`))

  if (!rendered.has(name)) {
    rendered.add(name)
    const panel = document.getElementById(`tab-${name}`)
    if (name === 'analytics') renderAnalytics(panel, store)
    if (name === 'explorer')  renderDataExplorer(panel, store)
    if (name === 'report')    renderReport(panel, store, summary)
  }
}

document.querySelectorAll('.nav-tab').forEach(t => t.addEventListener('click', () => switchTab(t.dataset.tab)))

// PDF shortcut
document.getElementById('btn-pdf').addEventListener('click', () => {
  switchTab('report')
  setTimeout(() => document.getElementById('btn-gen-pdf')?.click(), 300)
})

/* ═══════════════════════════════════════════
   BOOT
═══════════════════════════════════════════ */
setTimeout(() => {
  document.getElementById('loader').classList.add('hidden')
  rendered.add('analytics')
  renderAnalytics(document.getElementById('tab-analytics'), store)
}, 1500)
