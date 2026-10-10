(() => {
'use strict';
const data = window.PORTFOLIO;
const $ = (s) => document.querySelector(s);
const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const modal = $('#detail');
const detail = $('#detail-content');
const label = (kind) => kind === 'concept' ? 'AI 辅助概念练习' : '角色设计';
let lastTrigger = null;
function prepare(title, description, category, trigger) {
 lastTrigger = trigger;
 detail.replaceChildren();
 $('#detail-title').textContent = title;
 $('#detail-description').textContent = description;
 $('#detail-label').textContent = category;
 modal.showModal();
 document.body.style.overflow = 'hidden';
}
function unavailable(container, text) {
 container.append(el('p', 'media-error', text));
}
function openCollection(work, trigger) {
 prepare(work.title, work.description, label(work.kind), trigger);
 for (const item of work.images) {
  const figure = el('figure');
  const img = el('img'); img.src = item.src; img.alt = item.alt; img.loading = 'lazy'; img.decoding = 'async';
  img.addEventListener('error', () => { img.remove(); unavailable(figure, '这张图片暂时无法加载，请稍后重试。'); }, { once: true });
  figure.append(img, el('figcaption', '', item.alt));
  const link = el('a', 'download', '查看原图 ↗'); link.href = item.src; link.target = '_blank'; link.rel = 'noopener';
  figure.append(link); detail.append(figure);
 }
}
function renderWorks(category = '全部') {
 const list = data.collections.filter(w => category === '全部' || w.category === category);
 const grid = $('#works'); grid.replaceChildren();
 $('#work-count').textContent = String(list.length).padStart(2, '0') + ' COLLECTIONS';
 list.forEach((work) => {
  const card = el('article', 'work-card'); const button = el('button', 'work-open');
  button.type = 'button'; button.setAttribute('aria-label', '查看' + work.title + '完整作品集');
  const cover = el('div', 'work-cover'); const img = el('img'); img.src = work.cover; img.alt = work.title; img.loading = 'lazy'; img.decoding = 'async';
  img.addEventListener('error', () => cover.classList.add('broken'), { once: true });
  cover.append(img, el('span', 'cover-label', work.title), el('span', 'card-arrow', '↗'));
  const meta = el('div', 'card-meta'); const info = el('div');
  info.append(el('h3', '', work.title), el('p', '', work.subtitle + (work.kind === 'concept' ? ' · 概念练习' : '')));
  meta.append(info, el('span', 'index', String(data.collections.indexOf(work) + 1).padStart(2, '0')));
  button.append(cover, meta); button.addEventListener('click', () => openCollection(work, button));
  card.append(button); grid.append(card);
 });
}
function openFilm(film, trigger) {
 document.querySelectorAll('.film-cover video').forEach(v => v.pause());
 prepare(film.title, film.description, 'MOTION & FILM', trigger);
 const v = el('video'); v.src = film.src; v.poster = film.poster; v.controls = true; v.playsInline = true; v.preload = 'metadata';
 v.addEventListener('error', () => { unavailable(detail, '视频暂时无法加载，请稍后重试。'); }, { once: true });
 detail.append(v);
 const link = el('a', 'download', '在新窗口播放 ↗'); link.href = film.src; link.target = '_blank'; link.rel = 'noopener'; detail.append(link);
 v.play().catch(() => {});
}
function renderFilms() {
 const grid = $('#films'); grid.replaceChildren();
 data.films.forEach(film => {
  const article = el('article'); const button = el('button', 'film-open'); button.type = 'button'; button.setAttribute('aria-label', '播放' + film.title);
  const cover = el('div', 'film-cover'); const v = el('video'); v.src = film.src; v.poster = film.poster; v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'none'; v.setAttribute('aria-hidden', 'true'); v.tabIndex = -1;
  const overlay = el('div', 'film-overlay'); const play = el('span', 'play-icon', '▶'); const duration = el('span', 'duration', 'PLAY FILM');
  overlay.append(play, duration); cover.append(v, overlay);
  v.addEventListener('loadedmetadata', () => { if (Number.isFinite(v.duration)) duration.textContent = String(Math.floor(v.duration / 60)).padStart(2, '0') + ':' + String(Math.floor(v.duration % 60)).padStart(2, '0'); });
  v.addEventListener('error', () => cover.classList.add('failed'));
  const meta = el('div', 'card-meta'); const info = el('div'); info.append(el('h3', '', film.title), el('p', '', film.subtitle)); meta.append(info, el('span', 'index', '↗'));
  button.append(cover, meta);
  button.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse' && !reduced.matches) v.play().catch(() => {}); });
  button.addEventListener('pointerleave', () => v.pause());
  button.addEventListener('click', () => openFilm(film, button));
  article.append(button); grid.append(article);
 });
}
$('.close').addEventListener('click', () => modal.close());
modal.addEventListener('click', event => { if (event.target === modal) { const rect = modal.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) modal.close(); } });
modal.addEventListener('close', () => { detail.querySelectorAll('video').forEach(v => { v.pause(); v.removeAttribute('src'); v.load(); }); detail.replaceChildren(); document.body.style.overflow = ''; lastTrigger?.focus(); });
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
 document.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
 renderWorks(button.dataset.filter);
}));
$('#about-text').textContent = data.about;
data.skills.forEach(s => $('#skills').append(el('span', '', s)));
data.experience.forEach(job => { const article = el('article'); article.append(el('small', '', job.period), el('h4', '', job.company + ' / ' + job.role), el('p', '', job.description)); $('#experience').append(article); });
$('#education').textContent = data.education + ' · ' + data.qualification;
const heroCover = $('#hero-cover'); const coverReady = () => { if (heroCover.naturalWidth) $('#home').classList.add('cover-ready'); };
heroCover.addEventListener('load', coverReady); coverReady();
document.addEventListener('visibilitychange', () => { if (document.hidden) document.querySelectorAll('video').forEach(v => v.pause()); });
reduced.addEventListener('change', () => { if (reduced.matches) document.querySelectorAll('.film-cover video').forEach(v => v.pause()); });
renderWorks(); renderFilms();
})();
