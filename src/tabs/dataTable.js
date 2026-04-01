export function renderData(panel, data) {
  const sample = data.sample
  let currentPage = 1
  const perPage = 20
  let filteredData = [...sample]

  function render() {
    const start = (currentPage-1)*perPage
    const end   = start+perPage
    const page  = filteredData.slice(start,end)
    const total = filteredData.length
    const totalPages = Math.ceil(total/perPage)

    document.getElementById('table-body').innerHTML = `
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th><th>Date</th><th>TV</th><th>Dryer</th><th>Oven</th>
              <th>Fridge</th><th>Micro</th><th>Line V</th><th>Voltage</th>
              <th>Power (VA)</th><th>Energy (kWh)</th><th>Bandwidth</th><th>Offload</th>
            </tr>
          </thead>
          <tbody>
            ${page.map(r=>`
              <tr>
                <td style="color:var(--text-muted);font-family:'IBM Plex Mono',monospace;font-size:11px">#${r.id}</td>
                <td style="color:var(--text-muted);font-size:11px">${new Date(r.ts*1000).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'2-digit'})}</td>
                <td>${r.tv?'<span class="badge badge-on">ON</span>':'<span class="badge badge-off">OFF</span>'}</td>
                <td>${r.dryer?'<span class="badge badge-on">ON</span>':'<span class="badge badge-off">OFF</span>'}</td>
                <td>${r.oven?'<span class="badge badge-on">ON</span>':'<span class="badge badge-off">OFF</span>'}</td>
                <td>${r.fridge?'<span class="badge badge-on">ON</span>':'<span class="badge badge-off">OFF</span>'}</td>
                <td>${r.micro?'<span class="badge badge-on">ON</span>':'<span class="badge badge-off">OFF</span>'}</td>
                <td style="font-family:'IBM Plex Mono',monospace;font-size:12px">${r.lineV}V</td>
                <td style="font-family:'IBM Plex Mono',monospace;font-size:12px">${r.voltage}V</td>
                <td style="color:var(--warning);font-weight:600;font-family:'IBM Plex Mono',monospace;font-size:12px">${r.power}</td>
                <td style="color:var(--primary);font-weight:700;font-family:'IBM Plex Mono',monospace;font-size:12px">${r.energy}</td>
                <td style="color:var(--secondary);font-family:'IBM Plex Mono',monospace;font-size:12px">${(r.bw/1000).toFixed(1)}K</td>
                <td>${r.offload?'<span class="badge badge-offload">☁ Cloud</span>':'<span class="badge badge-local">🖥 Local</span>'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-top:14px">
        <span style="font-size:13px;color:var(--text-muted)">
          Showing <strong style="color:var(--primary)">${start+1}–${Math.min(end,total)}</strong>
          of <strong style="color:var(--text-primary)">${total.toLocaleString()}</strong> filtered records
        </span>
        <div style="display:flex;align-items:center;gap:8px">
          <button id="btn-prev" class="btn-export" style="padding:7px 14px;font-size:12px;${currentPage===1?'opacity:0.4;cursor:not-allowed':''}">‹ Prev</button>
          <span style="font-size:13px;color:var(--text-muted);padding:6px 14px;background:var(--bg-card2);border:1px solid var(--border);border-radius:7px;font-weight:600">
            ${currentPage} / ${totalPages}
          </span>
          <button id="btn-next" class="btn-export" style="padding:7px 14px;font-size:12px;${currentPage===totalPages?'opacity:0.4;cursor:not-allowed':''}">Next ›</button>
        </div>
      </div>
    `

    document.getElementById('btn-prev')?.addEventListener('click', ()=>{ if(currentPage>1){currentPage--;render()} })
    document.getElementById('btn-next')?.addEventListener('click', ()=>{ if(currentPage<totalPages){currentPage++;render()} })
  }

  panel.innerHTML = `
    <div class="page-header">
      <div class="page-title">Raw Data Explorer</div>
      <div class="page-desc">Browse, filter and inspect the full IoT transaction dataset (2,000 sample records)</div>
    </div>

    <div class="filters-bar">
      <div class="filter-group">
        <span class="filter-label">Transaction ID</span>
        <input type="number" id="search-id" placeholder="e.g. 1042"
          style="background:var(--bg-primary);border:1px solid var(--border);color:var(--text-primary);padding:6px 11px;border-radius:7px;font-family:'Inter',sans-serif;font-size:13px;width:140px;outline:none;transition:border-color 0.2s"
          onfocus="this.style.borderColor='#2563EB';this.style.boxShadow='0 0 0 3px rgba(37,99,235,0.1)'"
          onblur="this.style.borderColor='var(--border)';this.style.boxShadow='none'">
      </div>
      <div class="filter-divider"></div>
      <div class="filter-group">
        <span class="filter-label">Offload Type</span>
        <select class="filter-select" id="filter-offload">
          <option value="all">All Types</option>
          <option value="1">Cloud Only</option>
          <option value="0">Local Only</option>
        </select>
      </div>
      <div class="filter-divider"></div>
      <div class="filter-group">
        <span class="filter-label">Appliance ON</span>
        <select class="filter-select" id="filter-appliance">
          <option value="all">Any Device</option>
          <option value="tv">TV</option>
          <option value="dryer">Dryer</option>
          <option value="oven">Oven</option>
          <option value="fridge">Fridge</option>
          <option value="micro">Microwave</option>
        </select>
      </div>
      <div class="filter-divider"></div>
      <div class="filter-group">
        <span class="filter-label">Min Energy (kWh)</span>
        <input type="number" id="filter-energy" placeholder="e.g. 50"
          style="background:var(--bg-primary);border:1px solid var(--border);color:var(--text-primary);padding:6px 11px;border-radius:7px;font-family:'Inter',sans-serif;font-size:13px;width:110px;outline:none;transition:border-color 0.2s"
          onfocus="this.style.borderColor='#2563EB';this.style.boxShadow='0 0 0 3px rgba(37,99,235,0.1)'"
          onblur="this.style.borderColor='var(--border)';this.style.boxShadow='none'">
      </div>
      <div style="margin-left:auto;display:flex;gap:8px">
        <button class="btn-export" id="btn-apply-filter">🔍 Apply</button>
        <button class="btn-export" id="btn-reset-filter"
          style="background:white;color:var(--alert);border:1px solid var(--alert);box-shadow:none">
          ✕ Reset
        </button>
      </div>
    </div>

    <div id="table-body"></div>
  `

  render()

  document.getElementById('btn-apply-filter').addEventListener('click',()=>{
    const offload   = document.getElementById('filter-offload').value
    const appliance = document.getElementById('filter-appliance').value
    const minEnergy = parseFloat(document.getElementById('filter-energy').value)||0
    const searchId  = parseInt(document.getElementById('search-id').value)||0
    filteredData = sample.filter(r=>{
      if(offload!=='all' && r.offload!==parseInt(offload)) return false
      if(appliance!=='all' && !r[appliance]) return false
      if(r.energy<minEnergy) return false
      if(searchId && r.id!==searchId) return false
      return true
    })
    currentPage=1; render()
  })

  document.getElementById('btn-reset-filter').addEventListener('click',()=>{
    filteredData=[...sample]; currentPage=1
    document.getElementById('filter-offload').value='all'
    document.getElementById('filter-appliance').value='all'
    document.getElementById('filter-energy').value=''
    document.getElementById('search-id').value=''
    render()
  })
}
