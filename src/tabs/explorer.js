export function renderDataExplorer(panel, store) {
  let page = 1
  const PER = 25
  let localSearch = ''

  panel.innerHTML = `
    <div class="sec-head">
      <div>
        <div class="sec-title">Data Explorer</div>
        <div class="sec-sub">Browse filtered records — global filters apply automatically</div>
      </div>
    </div>

    <!-- local search + sort -->
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;flex-wrap:wrap">
      <div style="position:relative;flex:1;min-width:200px;max-width:340px">
        <span style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--faint);font-size:14px">🔍</span>
        <input id="exp-search" type="text" placeholder="Search by Transaction ID…"
          style="width:100%;padding:8px 12px 8px 32px;border:1.5px solid var(--border);border-radius:8px;
          font-family:'Inter',sans-serif;font-size:13px;color:var(--text);background:var(--surface);
          outline:none;transition:border-color .18s,box-shadow .18s"
          onfocus="this.style.borderColor='#2563EB';this.style.boxShadow='0 0 0 3px rgba(37,99,235,.1)'"
          onblur="this.style.borderColor='var(--border)';this.style.boxShadow='none'">
      </div>
      <select id="exp-sort" style="padding:8px 28px 8px 10px;border:1.5px solid var(--border);border-radius:8px;
        font-family:'Inter',sans-serif;font-size:13px;color:var(--text);background:var(--surface);
        -webkit-appearance:none;appearance:none;outline:none;cursor:pointer;
        background-image:url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2210%22 height=%226%22%3E%3Cpath d=%22M5 6L0 0h10z%22 fill=%22%2364748B%22/%3E%3C/svg%3E');
        background-repeat:no-repeat;background-position:right 9px center;min-width:180px">
        <option value="id-asc">Sort: ID ↑</option>
        <option value="id-desc">Sort: ID ↓</option>
        <option value="energy-desc">Sort: Energy (High→Low)</option>
        <option value="energy-asc">Sort: Energy (Low→High)</option>
        <option value="power-desc">Sort: Power (High→Low)</option>
        <option value="bw-desc">Sort: Bandwidth (High→Low)</option>
      </select>
      <div id="exp-count" style="font-size:12px;color:var(--muted);margin-left:auto;white-space:nowrap"></div>
    </div>

    <div id="exp-table"></div>
  `

  function getData() {
    let data = [...store.filtered()]
    // local ID search
    const q = localSearch.trim()
    if (q) data = data.filter(r => String(r.id).includes(q))
    // sort
    const sort = document.getElementById('exp-sort')?.value || 'id-asc'
    if (sort === 'id-asc')        data.sort((a,b)=>a.id-b.id)
    else if (sort === 'id-desc')  data.sort((a,b)=>b.id-a.id)
    else if (sort === 'energy-desc') data.sort((a,b)=>b.energy-a.energy)
    else if (sort === 'energy-asc')  data.sort((a,b)=>a.energy-b.energy)
    else if (sort === 'power-desc')  data.sort((a,b)=>b.power-a.power)
    else if (sort === 'bw-desc')     data.sort((a,b)=>b.bw-a.bw)
    return data
  }

  function render() {
    const data = getData()
    const total = data.length
    const totalPages = Math.max(1, Math.ceil(total / PER))
    if (page > totalPages) page = totalPages
    const slice = data.slice((page-1)*PER, page*PER)

    const cnt = document.getElementById('exp-count')
    if (cnt) cnt.textContent = `${total.toLocaleString()} records`

    const container = document.getElementById('exp-table')
    if (!container) return

    if (!slice.length) {
      container.innerHTML = `<div class="no-data"><div class="ico">🔍</div><p>No records match current filters</p></div>`
      return
    }

    container.innerHTML = `
      <div class="tbl-wrap">
        <table class="tbl">
          <thead>
            <tr>
              <th>ID</th><th>Date</th><th>TV</th><th>Dryer</th><th>Oven</th>
              <th>Fridge</th><th>Micro</th><th>Line V</th><th>Voltage</th>
              <th>Power (VA)</th><th>Energy (kWh)</th><th>Bandwidth</th><th>Offload</th>
            </tr>
          </thead>
          <tbody>
            ${slice.map(r => `<tr>
              <td class="mono" style="color:var(--muted)">#${r.id}</td>
              <td style="font-size:11px;color:var(--muted)">${new Date(r.ts*1000).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'2-digit'})}</td>
              <td>${r.tv?'<span class="badge b-on">ON</span>':'<span class="badge b-off">OFF</span>'}</td>
              <td>${r.dryer?'<span class="badge b-on">ON</span>':'<span class="badge b-off">OFF</span>'}</td>
              <td>${r.oven?'<span class="badge b-on">ON</span>':'<span class="badge b-off">OFF</span>'}</td>
              <td>${r.fridge?'<span class="badge b-on">ON</span>':'<span class="badge b-off">OFF</span>'}</td>
              <td>${r.micro?'<span class="badge b-on">ON</span>':'<span class="badge b-off">OFF</span>'}</td>
              <td class="num">${r.lineV}V</td>
              <td class="num">${r.voltage}V</td>
              <td class="num" style="color:#7C3AED;font-weight:600">${r.power}</td>
              <td class="num" style="color:#2563EB;font-weight:700">${r.energy}</td>
              <td class="num" style="color:#0891B2">${(r.bw/1000).toFixed(1)}K</td>
              <td>${r.offload?'<span class="badge b-cloud">☁ Cloud</span>':'<span class="badge b-local">🖥 Local</span>'}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
      <div class="pag">
        <div class="pag-info">Showing <b>${(page-1)*PER+1}–${Math.min(page*PER,total)}</b> of <b>${total.toLocaleString()}</b></div>
        <div class="pag-btns">
          <button class="pag-btn" id="pg-first" ${page===1?'disabled':''}>«</button>
          <button class="pag-btn" id="pg-prev"  ${page===1?'disabled':''}>‹ Prev</button>
          <span class="pag-cur">${page} / ${totalPages}</span>
          <button class="pag-btn" id="pg-next" ${page===totalPages?'disabled':''}>Next ›</button>
          <button class="pag-btn" id="pg-last" ${page===totalPages?'disabled':''}>»</button>
        </div>
      </div>
    `

    document.getElementById('pg-first')?.addEventListener('click', ()=>{page=1;render()})
    document.getElementById('pg-prev')?.addEventListener('click',  ()=>{if(page>1){page--;render()}})
    document.getElementById('pg-next')?.addEventListener('click',  ()=>{if(page<totalPages){page++;render()}})
    document.getElementById('pg-last')?.addEventListener('click',  ()=>{page=totalPages;render()})
  }

  // Search
  document.getElementById('exp-search').addEventListener('input', function() {
    localSearch = this.value; page = 1; render()
  })
  // Sort
  document.getElementById('exp-sort').addEventListener('change', () => { page = 1; render() })

  // React to global filters
  store.subscribe(() => { page = 1; render() })

  render()
}
