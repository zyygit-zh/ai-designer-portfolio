'use strict';
window.renderGarmentCase = function () {
 const base='assets/garment/';
 const photo=(name,alt,cls='')=>`<img class="${cls}" src="${base+name}.webp" alt="${alt}" loading="lazy" decoding="async">`;
 const zoom=(name,alt,cls='')=>`<a class="gc-zoom ${cls}" href="${base+name}.webp" target="_blank" rel="noopener" aria-label="放大查看：${alt}">${photo(name,alt)}<span>查看大图 ↗</span></a>`;
 return `<article class="garment-case">
 <header class="gc-hero">
  <div class="gc-topline"><span>SELECTED WORK / 2026.11</span><span>E-COMMERCE VISUAL</span></div>
  <p class="gc-kicker">服装商品图制作与标准化</p>
  <h1>从实拍，<br>到商品<span>。</span></h1>
  <div class="gc-hero-bottom"><p>把门店实拍整理为统一、清晰的电商视觉。<br>从服装轮廓、面料细节，到主图与详情的完整交付。</p><span>AI 辅助修图<br>版式设计 / 自动化制作</span></div>
  <div class="gc-hero-art">${photo('blazer-cutout','去人台后的白色系带外套','gc-garment-one')}${photo('coat-cutout','深灰色长款大衣去背素材','gc-garment-two')}<span class="gc-art-index">GARMENT<br>IMAGE SYSTEM</span></div>
  <dl class="gc-facts"><div><dt>我的工作</dt><dd>素材整理 · 图像处理 · 版式与交付</dd></div><div><dt>制作方式</dt><dd>AI 辅助 / Python 模板排版</dd></div><div><dt>覆盖品类</dt><dd>外套 · 大衣 · 半裙 · 马甲 · 羽绒服</dd></div></dl>
 </header>
 <section class="gc-section gc-compare" aria-labelledby="gc-compare-title">
  <div class="gc-section-head"><span class="gc-num">01 / BEFORE & AFTER</span><h2 id="gc-compare-title">同一件衣服，<br>更清楚地呈现。</h2><p>去除人台与环境干扰，整理衣身和系带轮廓；结合原片核对颜色、领口、袖口与下摆。</p></div>
  <div class="gc-tabs" role="tablist" aria-label="选择对比款式"><button id="gc-tab-blazer" role="tab" aria-selected="true" aria-controls="gc-compare-blazer" tabindex="0" data-gc-tab="blazer">白色系带外套 <span>S621516</span></button><button id="gc-tab-coat" role="tab" aria-selected="false" aria-controls="gc-compare-coat" tabindex="-1" data-gc-tab="coat">深灰色长款大衣 <span>S621597</span></button></div>
  ${[['blazer','blazer-before','blazer-white','白色系带外套'],['coat','coat-before','coat-gray','深灰色长款大衣']].map(([id,before,after,title],i)=>`<div id="gc-compare-${id}" class="gc-pair" role="tabpanel" aria-labelledby="gc-tab-${id}" ${i?'hidden':''}><figure><figcaption><b>BEFORE</b><span>门店实拍 / 原始素材</span></figcaption>${zoom(before,title+'门店原始实拍','gc-before')}</figure><figure><figcaption><b>AFTER</b><span>白底主图 / 制作成品</span></figcaption>${zoom(after,title+'白底主图成品','gc-after')}</figure></div>`).join('')}
  <p class="gc-note">展示为实际工作素材与制作成品。成品包含 AI 辅助处理，重点呈现去人台、轮廓整理和构图统一。</p>
 </section>
 <section class="gc-section gc-series" aria-labelledby="gc-series-title">
  <div class="gc-section-head"><span class="gc-num">02 / SERIES</span><h2 id="gc-series-title">让不同款色，<br>保持同一种秩序。</h2><p>统一字标、画布、衣身占比与上下留白。按款号、颜色整理输出，使成套商品图保持连贯。</p></div>
  <div class="gc-series-grid">${[['blazer-white','系带外套 / 白色'],['blazer-black','系带外套 / 黑色'],['coat-gray','长款大衣 / 深灰色'],['coat-black','长款大衣 / 黑色'],['coat-milk','长款大衣 / 奶茶色'],['coat-short','短款大衣 / 驼色']].map(([name,label],i)=>`<figure>${zoom(name,label+'主图成品')}<figcaption><span>${String(i+1).padStart(2,'0')}</span>${label}</figcaption></figure>`).join('')}</div>
  <div class="gc-delivery"><p>一次成套交付的文件记录</p><p><strong>34</strong> 张主图 <i>+</i> <strong>12</strong> 张详情页</p><span>2026.11.03 · 高清素材回贴版<br>从既有源文件恢复细节，再按原位置回贴与复检。</span></div>
 </section>
 <section class="gc-section gc-details" aria-labelledby="gc-details-title">
  <div class="gc-section-head"><span class="gc-num">03 / DETAIL DESIGN</span><h2 id="gc-details-title">整件看版型，<br>近处看质感。</h2><p>按整件展示、局部细节、面料、产品信息和尺码组织阅读顺序。让购买者能顺着画面看清商品。</p></div>
  <div class="gc-texture"><figure>${zoom('collar','大衣领口与扣位细节')}<figcaption>结构 / 领口与扣位</figcaption></figure><figure>${zoom('fabric','大衣褶皱面料小样')}<figcaption>质感 / 毛呢与自然褶皱</figcaption></figure><div><span class="gc-small-label">DETAIL MATTERS</span><h3>细节有取舍，<br>画面有呼吸。</h3><p>先看清部位，再确定裁切。领口开口、袖口末端与下摆收边完整保留，照片内部也留出空白。</p></div></div>
  <div class="gc-long-grid">${[['blazer-detail','系带外套 / 完整详情'],['coat-detail','长款大衣 / 完整详情']].map(([name,label])=>`<details class="gc-long"><summary><span>${label}</span><span class="gc-expand">展开 / 收起 ↕</span></summary><div class="gc-long-window">${photo(name,label)}</div><a href="${base+name}.webp" target="_blank" rel="noopener">独立查看整张长图 ↗</a></details>`).join('')}</div>
  <p class="gc-note">以上为 11 月 3 日制作成品，详情宽 1024 px；新版模板的尺寸与细节排法见下方。网页预览使用压缩图。</p>
 </section>
 <section class="gc-section gc-system" aria-labelledby="gc-system-title">
  <div class="gc-section-head"><span class="gc-num">04 / REUSABLE SYSTEM</span><h2 id="gc-system-title">把一次排版，<br>沉淀为制作标准。</h2><p>将字标、图框、间距和输出尺寸写入固定模板。先完成单款核对，再替换素材与资料，批量渲染。</p></div>
  <div class="gc-specs"><div><span>主图 / 每色一张</span><strong>2048 × 2048</strong><small>px · 原尺寸输出</small></div><div><span>详情 / 标准2模板</span><strong>1360 × 6156</strong><small>px · 2026.11.04 更新</small></div></div>
  <div class="gc-layout"><div><span class="gc-small-label">SPACING & COMPOSITION</span><h3>上大下二小。<br>留白也有标准。</h3><p>新版细节拼图区宽 960 px，左右各留 200 px；排间 18 px，列间 20 px。按不同部位保留领顶、袖口和下摆的空间。</p><p class="gc-note">右侧为《标准2》参考素材的模板验证样张，用于展示版式复现与留白控制。</p></div>${zoom('layout-spacing','标准2参考素材的模板验证样张：上大下二小细节与留白')}</div>
  <ol class="gc-process"><li><span>01</span><h3>整理资料</h3><p>按款色归档原片、细节和吊牌，核对本款信息。</p></li><li><span>02</span><h3>处理素材</h3><p>去人台、去背景、整理轮廓，统一同款画面。</p></li><li><span>03</span><h3>配置排版</h3><p>替换图片、成分与尺码，使用固定模板渲染。</p></li><li><span>04</span><h3>核对交付</h3><p>检查轮廓、文字、留白及像素尺寸，分类导出。</p></li></ol>
 </section>
 <section class="gc-section gc-capabilities" aria-labelledby="gc-capabilities-title"><span class="gc-num">05 / WHAT I BRING</span><h2 id="gc-capabilities-title">从画面处理，<br>到成套落地。</h2><div class="gc-capability-list"><div><span>01</span><h3>商品视觉处理</h3><p>根据实拍制作干净的白底素材，关注服装结构、色彩与面料的表达。</p></div><div><span>02</span><h3>电商信息排版</h3><p>把主图、细节、面料与尺码整合为有层次的长图，控制图文比例和阅读节奏。</p></div><div><span>03</span><h3>系列一致性</h3><p>跨款色统一商品比例、字标位置和构图，让批量输出保持同一套视觉标准。</p></div><div><span>04</span><h3>流程与自动化</h3><p>使用 Python 与配置化模板批量渲染、检查尺寸，并保留素材与版本记录。</p></div></div><p class="gc-resume">能够结合 AI 图像处理与 Python 自动化，完成服装实拍素材整理、白底主图、商品详情长图和多款多色的标准化输出。</p></section>
 <footer class="gc-footer"><span>朱雨雨 / AI VISUAL DESIGNER</span><span>服装商品图案例 · 2026</span></footer>
 </article>`;
};
function selectGarmentTab(root,id,focus=false){
 root.querySelectorAll('[data-gc-tab]').forEach(button=>{const on=button.dataset.gcTab===id;button.setAttribute('aria-selected',String(on));button.tabIndex=on?0:-1;if(on&&focus)button.focus();});
 root.querySelectorAll('[role="tabpanel"]').forEach(panel=>{panel.hidden=panel.id!=='gc-compare-'+id;});
}
document.addEventListener('click',event=>{const tab=event.target.closest('[data-gc-tab]');if(tab)selectGarmentTab(tab.closest('.garment-case'),tab.dataset.gcTab);});
document.addEventListener('keydown',event=>{const tab=event.target.closest('[data-gc-tab]');if(!tab||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const id=event.key==='Home'?'blazer':event.key==='End'?'coat':tab.dataset.gcTab==='blazer'?'coat':'blazer';selectGarmentTab(tab.closest('.garment-case'),id,true);});
if(document.querySelector('#garment-case-page'))document.querySelector('#garment-case-page').innerHTML=window.renderGarmentCase();
