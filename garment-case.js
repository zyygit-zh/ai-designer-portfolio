'use strict';
window.renderGarmentCase = function () {
 const base='assets/garment/';
 const labels=['撞色滚边大衣','连帽短款羽绒服','翻袖单排扣西装','提花半裙','深色长款大衣','长款羽绒服','灰色双排扣西装','黑色双排扣西装'];
 const comparisons=labels.map((title,i)=>({id:'white-'+(i+1),title,before:'assets/process/white-'+(i+1)+'-before.webp',after:'assets/process/white-'+(i+1)+'-after.webp'})).concat([{id:'blazer',title:'白色系带外套',before:base+'blazer-before.webp',after:base+'blazer-white.webp'},{id:'coat',title:'深灰色长款大衣',before:base+'coat-before.webp',after:base+'coat-gray.webp'}]);
 const photo=(name,alt,cls='')=>`<img class="${cls}" src="${base+name}.webp" alt="${alt}" loading="lazy" decoding="async">`;
 const zoom=(name,alt,cls='')=>`<a class="gc-zoom ${cls}" href="${base+name}.webp" target="_blank" rel="noopener" aria-label="放大查看：${alt}">${photo(name,alt)}<span>查看大图 ↗</span></a>`;
 return `<article class="garment-case">
 <header class="gc-hero">
  <div class="gc-topline"><span>SELECTED WORK / GARMENT</span><span>E-COMMERCE VISUAL</span></div>
  <p class="gc-kicker">服装商品视觉</p>
  <h1>从实拍，<br>到商品<span>。</span></h1>
  <div class="gc-hero-bottom"><p>把门店实拍整理为统一、清晰的电商视觉。<br>从服装轮廓、面料细节，到主图与详情的完整交付。</p><span>AI 辅助修图<br>版式设计 / 自动化制作</span></div>
  <div class="gc-hero-art">${photo('blazer-cutout','去人台后的白色系带外套','gc-garment-one')}${photo('coat-cutout','深灰色长款大衣去背素材','gc-garment-two')}<span class="gc-art-index">GARMENT<br>IMAGE SYSTEM</span></div>
  <dl class="gc-facts"><div><dt>我的工作</dt><dd>素材整理 · 图像处理 · 版式与交付</dd></div><div><dt>制作方式</dt><dd>AI 辅助 / Python 模板排版</dd></div><div><dt>覆盖品类</dt><dd>外套 · 大衣 · 半裙 · 马甲 · 羽绒服</dd></div></dl>
 </header>
 <section class="gc-section gc-compare" aria-labelledby="gc-compare-title">
  <div class="gc-section-head"><span class="gc-num">01 / BEFORE & AFTER</span><h2 id="gc-compare-title">同一件衣服，<br>更清楚地呈现。</h2><p>去除人台与环境干扰，整理衣身和系带轮廓；结合原片核对颜色、领口、袖口与下摆。</p></div>
  <div class="gc-comparison-grid">${comparisons.map(({before,after,title})=>`<div class="gc-pair"><figure><figcaption><b>BEFORE</b></figcaption><div class="gc-photo gc-before"><img src="${before}" alt="${title}门店原始实拍" loading="lazy" decoding="async"></div></figure><figure><figcaption><b>AFTER</b></figcaption><div class="gc-photo gc-after"><img src="${after}" alt="${title}白底商品图成品" loading="lazy" decoding="async"></div></figure></div>`).join('')}</div>
 </section>
 <section class="gc-section gc-series" aria-labelledby="gc-series-title">
  <div class="gc-section-head"><span class="gc-num">02 / SERIES</span><h2 id="gc-series-title">让不同款色，<br>保持同一种秩序。</h2><p>统一字标、画布、衣身占比与上下留白。按款号、颜色整理输出，使成套商品图保持连贯。</p></div>
  <div class="gc-series-grid">${[['blazer-white','系带外套 / 白色'],['blazer-black','系带外套 / 黑色'],['coat-gray','长款大衣 / 深灰色'],['coat-black','长款大衣 / 黑色'],['coat-milk','长款大衣 / 奶茶色'],['coat-short','短款大衣 / 驼色']].map(([name,label])=>`<figure>${photo(name,label+'主图成品')}</figure>`).join('')}</div>
 </section>
 <section class="gc-section gc-details" aria-labelledby="gc-details-title">
  <div class="gc-section-head"><span class="gc-num">03 / DETAIL DESIGN</span><h2 id="gc-details-title">整件看版型，<br>近处看质感。</h2><p>按整件展示、局部细节、面料、产品信息和尺码组织阅读顺序。让购买者能顺着画面看清商品。</p></div>
  <div class="gc-texture"><figure>${zoom('collar','大衣领口与扣位细节')}<figcaption>结构 / 领口与扣位</figcaption></figure><figure>${zoom('fabric','大衣褶皱面料小样')}<figcaption>质感 / 毛呢与自然褶皱</figcaption></figure><div><span class="gc-small-label">DETAIL MATTERS</span><h3>细节有取舍，<br>画面有呼吸。</h3><p>先看清部位，再确定裁切。领口开口、袖口末端与下摆收边完整保留，照片内部也留出空白。</p></div></div>
  <div class="gc-long-grid">${[['blazer-detail','系带外套 / 完整详情'],['coat-detail','长款大衣 / 完整详情']].map(([name,label])=>`<details class="gc-long"><summary><span>${label}</span><span class="gc-expand">展开 / 收起 ↕</span></summary><div class="gc-long-window">${photo(name,label)}</div><a href="${base+name}.webp" target="_blank" rel="noopener">独立查看整张长图 ↗</a></details>`).join('')}</div>
 </section>
 <section class="gc-section gc-system" aria-labelledby="gc-system-title">
  <div class="gc-section-head"><span class="gc-num">04 / WORKFLOW</span><h2 id="gc-system-title">流程与自动化</h2><p>通过 ComfyUI 调整面料质感与衣缘，再结合 Python 模板完成主图与详情排版。</p></div>
  <figure class="gc-workflow"><a class="gc-zoom" href="${base}comfyui-workflow.jpg" target="_blank" rel="noopener" aria-label="放大查看 ComfyUI 服装面料处理工作流"><img src="${base}comfyui-workflow.jpg" alt="深灰色大衣的 ComfyUI 实际工作流：面料参考、图像处理节点及成品预览" width="2560" height="1058" loading="lazy" decoding="async"><span>查看工作流大图 ↗</span></a><figcaption><span>ComfyUI / 服装面料处理工作流</span><span>面料质感 · 轮廓控制 · 模板排版</span></figcaption></figure>
 </section>
 <section class="gc-section gc-capabilities" aria-labelledby="gc-capabilities-title"><span class="gc-num">05 / WHAT I BRING</span><h2 id="gc-capabilities-title">从画面处理，<br>到成套落地。</h2><div class="gc-capability-list"><div><span>01</span><h3>商品视觉处理</h3><p>根据实拍制作干净的白底素材，关注服装结构、色彩与面料的表达。</p></div><div><span>02</span><h3>电商信息排版</h3><p>把主图、细节、面料与尺码整合为有层次的长图，控制图文比例和阅读节奏。</p></div><div><span>03</span><h3>系列一致性</h3><p>跨款色统一商品比例、字标位置和构图，让批量输出保持同一套视觉标准。</p></div><div><span>04</span><h3>流程与自动化</h3><p>结合 ComfyUI 图像工作流与 Python 模板，将素材处理和批量排版衔接起来。</p></div></div><p class="gc-resume">结合 AI 图像处理、ComfyUI 与 Python，让商品视觉从单张修图延伸到成套设计。</p></section>
 <footer class="gc-footer"><span>朱雨雨 / AI VISUAL DESIGNER</span><span>服装商品图案例 · 2026</span></footer>
 </article>`;
};
if(document.querySelector('#garment-case-page'))document.querySelector('#garment-case-page').innerHTML=window.renderGarmentCase();
