(() => {
  const config = window.PAGE_CONFIG || {};
  const all = window.ALL_FIGURES || [];
  const ids = new Set(config.figureIds || all.map(f => f.id));
  const figures = all.filter(f => ids.has(f.id));
  const byId = new Map(all.map(f => [f.id, f]));
  const figNo = id => `Fig. ${String(id).padStart(2, '0')}`;
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  const chaptersRoot = document.getElementById('chapters');
  if (chaptersRoot && Array.isArray(config.sections)) {
    chaptersRoot.innerHTML = config.sections.map(section => {
      const figs = section.figureIds.map(id => byId.get(id)).filter(Boolean);
      return `<section id="${esc(section.id)}" class="chapter">
        <div class="chapter-head">
          <div class="chapter-num">${esc(section.number)}</div>
          <div class="chapter-copy">
            <h3>${esc(section.title)}</h3>
            <p>${esc(section.summary)}</p>
            <div class="note-grid">
              <div class="note"><strong>解释重点</strong><p>${esc(section.focus)}</p></div>
              <div class="note"><strong>解释边界</strong><p>${esc(section.boundary)}</p></div>
            </div>
          </div>
        </div>
        <div class="mini-grid">${figs.map(f => `<figure class="mini" data-open="${f.id}">
          <div class="thumb"><img src="${esc(f.src)}" alt="${figNo(f.id)} ${esc(f.title)}" loading="lazy"></div>
          <figcaption><b>${figNo(f.id)} · ${esc(f.category)}</b>${esc(f.title)}</figcaption>
        </figure>`).join('')}</div>
      </section>`;
    }).join('');
  }

  let active = '全部';
  let query = '';
  const chips = document.getElementById('chips');
  const table = document.getElementById('figureTable');
  const count = document.getElementById('figureCount');
  const search = document.getElementById('search');

  function renderChips() {
    if (!chips) return;
    const cats = ['全部', ...new Set(figures.map(f => f.category))];
    chips.innerHTML = cats.map(cat => `<button class="chip ${cat === active ? 'active' : ''}" data-cat="${esc(cat)}">${esc(cat)}</button>`).join('');
  }

  function renderTable() {
    if (!table) return;
    const needle = query.trim().toLowerCase();
    const list = figures.filter(f =>
      (active === '全部' || f.category === active) &&
      (!needle || `${f.title} ${f.caption} ${f.category}`.toLowerCase().includes(needle))
    );
    if (count) count.textContent = `${list.length} / ${figures.length} 张图`;
    table.innerHTML = '<div class="figure-row header-row"><div>缩略图</div><div>编号</div><div>图题</div><div>说明</div><div>操作</div></div>' +
      list.map(f => `<div class="figure-row">
        <div><img class="figure-thumb" data-open="${f.id}" src="${esc(f.src)}" alt="${figNo(f.id)}"></div>
        <div><span class="fig-no">${figNo(f.id)}</span><br><span class="fig-cat">${esc(f.category)}</span></div>
        <div class="fig-title">${esc(f.title)}</div>
        <div class="fig-cap">${esc(f.caption)}</div>
        <div><button class="open" data-open="${f.id}">查看</button></div>
      </div>`).join('');
  }

  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxMeta = document.getElementById('lightboxMeta');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxCaption = document.getElementById('lightboxCaption');

  function openFig(id) {
    const f = byId.get(Number(id));
    if (!f || !lightbox) return;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    lightboxImg.src = f.src;
    lightboxImg.alt = `${figNo(f.id)} ${f.title}`;
    lightboxMeta.textContent = `${figNo(f.id)} · ${f.category}`;
    lightboxTitle.textContent = f.title;
    lightboxCaption.textContent = f.caption;
  }

  function closeFig() {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxImg.removeAttribute('src');
  }

  renderChips();
  renderTable();

  document.addEventListener('click', event => {
    const opener = event.target.closest('[data-open]');
    if (opener) {
      openFig(opener.dataset.open);
      return;
    }
    const chip = event.target.closest('.chip');
    if (chip) {
      active = chip.dataset.cat;
      renderChips();
      renderTable();
      return;
    }
    if (event.target.matches('[data-close]') || event.target === lightbox) closeFig();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeFig();
  });

  if (search) search.addEventListener('input', event => {
    query = event.target.value;
    renderTable();
  });
})();
