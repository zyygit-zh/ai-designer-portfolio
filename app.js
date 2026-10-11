'use strict';
const projects=window.portfolioProjects;
const gallery=document.querySelector('#gallery'),galleryRange=document.querySelector('#gallery-range'),dialog=document.querySelector('#project-dialog'),lightbox=document.querySelector('#lightbox');
let filter='visual',currentProject=null,currentImages=[],imageIndex=0,lastTrigger=null;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function catalogProjects(){
 const order=filter==='video'?['princess','emotion','product','character','clothing']:['orbit','launch','still','weekend','between','form','clothing','character-design'];
 return order.map(id=>projects.find(p=>p.id===id)).filter(Boolean);
}
function renderGallery(){
 const list=catalogProjects(),video=filter==='video';
 document.querySelector('#catalog-type').textContent=video?'AI VIDEO PRODUCTION':'GRAPHIC & VISUAL DESIGN';
 gallery.setAttribute('aria-label',video?'AI 视频制作项目目录':'平面视觉设计项目目录');
 gallery.innerHTML=list.map((p,i)=>`<button class="work catalog-card" data-project="${p.id}" ${video?'data-mode="video"':''} aria-label="查看${esc(p.title)}${video?'视频':''}" style="--card-angle:${[-7,-2,6,-5,4,-3,6,-4][i%8]}deg;--card-offset:${[20,0,27,9,23,3,18,7][i%8]}px">
 <div class="catalog-card-top"><span class="catalog-card-number">${String(i+1).padStart(2,'0')}</span><span class="catalog-card-label">${video?'AI VIDEO':p.category==='concept'?'概念练习':'视觉项目'}</span></div>
 <h3>${esc(p.title)}</h3><p class="catalog-card-subtitle">${esc(video?p.id==='clothing'?'虚拟童模 · 动态换装':p.subtitle:p.subtitle)}</p>
 <div class="catalog-thumbnail"><img src="${p.cover}" alt="${esc(p.title+'作品预览')}" draggable="false" ${i>3?'loading="lazy"':''}>${video?'<span class="catalog-play" aria-hidden="true">▶</span>':''}</div>
 <span class="catalog-card-bottom">${video?'观看作品':'进入项目'} <span aria-hidden="true">↗</span></span>
 </button>`).join('');
 gallery.scrollLeft=0;updateStatus();
}
function updateStatus(){
 const cards=[...gallery.children];if(!cards.length)return;
 let closest=0,min=Infinity;const edge=gallery.getBoundingClientRect().left+gallery.clientWidth*.05;
 cards.forEach((c,i)=>{const d=Math.abs(c.getBoundingClientRect().left-edge);if(d<min){min=d;closest=i}});
 document.querySelector('#gallery-status').textContent=`${String(closest+1).padStart(2,'0')} / ${String(cards.length).padStart(2,'0')}`;
 const maxScroll=Math.max(0,gallery.scrollWidth-gallery.clientWidth),ratio=maxScroll?Math.max(0,Math.min(1,gallery.scrollLeft/maxScroll)):0;
 galleryRange.value=String(Math.round(ratio*1000));
 galleryRange.disabled=maxScroll<1;
 galleryRange.setAttribute('aria-valuetext',`浏览进度 ${Math.round(ratio*100)}%，共 ${cards.length} 项作品`);
 const width=galleryRange.clientWidth;
 galleryRange.style.setProperty('--rail-thumb-width',Math.min(width,Math.max(56,width*gallery.clientWidth/gallery.scrollWidth))+'px');
}
function shift(direction){const card=gallery.querySelector('.work');if(card)gallery.scrollBy({left:(gallery.children[1]?gallery.children[1].offsetLeft-card.offsetLeft:card.offsetWidth)*direction,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});}
function showProject(id,videoFirst=false){
 const p=projects.find(p=>p.id===id);if(!p)return;
 currentProject=p;currentImages=[];
 document.querySelector('#project-type').textContent=p.label;
 const images=p.sections.map(section=>`<section><h3>${esc(section.title)}</h3>${section.text?`<p class="section-copy">${esc(section.text)}</p>`:''}<div class="project-images ${section.layout}">${section.images.map(([src,caption])=>{
  const i=currentImages.length;currentImages.push({src,caption});
  return `<figure><button data-image="${i}" aria-label="放大${esc(caption)}"><img src="${src}" loading="lazy" alt="${esc(caption)}"></button><figcaption>${esc(caption)}</figcaption></figure>`;
 }).join('')}</div></section>`).join('');
 const videos=(p.videos||[]).map(([src,title,poster])=>`<section class="video-block"><h3>${esc(title)}</h3><video controls playsinline preload="none" poster="${poster}" src="${src}"></video><p>点击播放。声音、进度和全屏可通过播放器控制。</p></section>`).join('');
 document.querySelector('#project-content').innerHTML=`<div class="project-header"><h2 id="project-title">${esc(p.title)}</h2><p class="summary">${esc(p.summary)}</p><div class="project-facts"><div><strong>展示范围</strong>${esc(p.scope)}</div><div><strong>个人职责</strong>${esc(p.role)}</div></div></div><div class="project-body">${videoFirst?videos+images:images+videos}<p class="project-note">${esc(p.note||(p.category==='concept'?'本项目为此前会话的 AI 辅助概念练习，未标为真实客户项目。展示图为位图，图内文字、产品一致性和原生设计规范仍需精修。':''))}</p></div>`;
 if(!dialog.open)dialog.showModal();dialog.scrollTop=0;document.body.classList.add('modal-open');
}
function stopVideo(){dialog.querySelectorAll('video').forEach(v=>v.pause());}
function closeProject(){stopVideo();if(lightbox.open)lightbox.close();if(dialog.open)dialog.close();if(location.hash.startsWith('#project/'))history.replaceState(null,'',location.pathname+location.search+'#works');}
function syncRoute(){
 if(location.hash.startsWith('#project/')){
  let parts;try{parts=location.hash.slice(9).split('/').map(decodeURIComponent)}catch{return}
  const [id,mode]=parts;
  if(projects.some(p=>p.id===id)&&parts.length<=2&&(!mode||mode==='video')){
   if(mode==='video'&&filter!=='video'){
    filter='video';document.querySelectorAll('[data-filter]').forEach(b=>{const active=b.dataset.filter===filter;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});renderGallery();
   }
   showProject(id,mode==='video');
  }else closeProject();
 }else if(dialog.open)closeProject();
}
function showImage(i){if(!currentImages.length)return;imageIndex=(i+currentImages.length)%currentImages.length;const item=currentImages[imageIndex];const image=document.querySelector('#lightbox-image');image.src=item.src;image.alt=item.caption;document.querySelector('#lightbox-caption').textContent=item.caption;document.querySelector('#lightbox-index').textContent=`${imageIndex+1} / ${currentImages.length}`;if(!lightbox.open)lightbox.showModal();}
document.addEventListener('click',e=>{const project=e.target.closest('[data-project]');if(project){lastTrigger=project;const hash='#project/'+project.dataset.project+(project.dataset.mode==='video'?'/video':'');if(location.hash===hash)showProject(project.dataset.project,project.dataset.mode==='video');else location.hash=hash}const image=e.target.closest('[data-image]');if(image)showImage(Number(image.dataset.image));});
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{filter=button.dataset.filter;document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button))});renderGallery();}));
gallery.addEventListener('scroll',updateStatus,{passive:true});
window.addEventListener('resize',updateStatus);
gallery.addEventListener('keydown',e=>{if(e.target!==gallery)return;if(e.key==='ArrowRight'){e.preventDefault();shift(1)}if(e.key==='ArrowLeft'){e.preventDefault();shift(-1)}});
galleryRange.addEventListener('input',()=>{
 const maxScroll=Math.max(0,gallery.scrollWidth-gallery.clientWidth);
 gallery.scrollLeft=maxScroll*Number(galleryRange.value)/1000;
 updateStatus();
});
document.querySelector('.catalog-navigation').addEventListener('wheel',e=>{
 const delta=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;
 const amount=delta*(e.deltaMode===1?16:e.deltaMode===2?gallery.clientWidth:1);
 const maxScroll=Math.max(0,gallery.scrollWidth-gallery.clientWidth);
 if((amount>0&&gallery.scrollLeft<maxScroll-1)||(amount<0&&gallery.scrollLeft>1)){
  e.preventDefault();gallery.scrollLeft=Math.max(0,Math.min(maxScroll,gallery.scrollLeft+amount));updateStatus();
 }
},{passive:false});
let galleryDrag=null,suppressGalleryClickUntil=0;
gallery.addEventListener('pointerdown',e=>{
 if(e.pointerType==='touch'||!e.isPrimary||e.button!==0)return;
 galleryDrag={id:e.pointerId,x:e.clientX,y:e.clientY,left:gallery.scrollLeft,active:false};
 suppressGalleryClickUntil=0;
});
gallery.addEventListener('pointermove',e=>{
 if(!galleryDrag||galleryDrag.id!==e.pointerId)return;
 const dx=e.clientX-galleryDrag.x,dy=e.clientY-galleryDrag.y;
 if(!galleryDrag.active){
  if(Math.abs(dy)>8&&Math.abs(dy)>Math.abs(dx)){galleryDrag=null;return}
  if(Math.abs(dx)<8)return;
  galleryDrag.active=true;gallery.setPointerCapture(e.pointerId);gallery.classList.add('is-dragging');
 }
 e.preventDefault();gallery.scrollLeft=galleryDrag.left-dx;
});
function finishGalleryDrag(e){
 if(!galleryDrag||galleryDrag.id!==e.pointerId)return;
 if(galleryDrag.active)suppressGalleryClickUntil=performance.now()+350;
 galleryDrag=null;gallery.classList.remove('is-dragging');
 if(gallery.hasPointerCapture(e.pointerId))gallery.releasePointerCapture(e.pointerId);
}
gallery.addEventListener('pointerup',finishGalleryDrag);
gallery.addEventListener('pointercancel',finishGalleryDrag);
gallery.addEventListener('lostpointercapture',finishGalleryDrag);
gallery.addEventListener('pointerleave',()=>{if(galleryDrag&&!galleryDrag.active)galleryDrag=null});
gallery.addEventListener('dragstart',e=>e.preventDefault());
gallery.addEventListener('click',e=>{
 if(e.detail>0&&performance.now()<suppressGalleryClickUntil){e.preventDefault();e.stopPropagation()}
},true);
document.querySelector('#close-project').addEventListener('click',closeProject);dialog.addEventListener('cancel',e=>{e.preventDefault();closeProject()});dialog.addEventListener('close',()=>{stopVideo();document.body.classList.remove('modal-open');if(lastTrigger?.isConnected)lastTrigger.focus({preventScroll:true});});dialog.addEventListener('click',e=>{if(e.target===dialog){const rect=dialog.getBoundingClientRect();if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)closeProject();}});
document.querySelector('#close-lightbox').addEventListener('click',()=>lightbox.close());document.querySelector('#lightbox-prev').addEventListener('click',()=>showImage(imageIndex-1));document.querySelector('#lightbox-next').addEventListener('click',()=>showImage(imageIndex+1));lightbox.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();showImage(imageIndex-1)}if(e.key==='ArrowRight'){e.preventDefault();showImage(imageIndex+1)}});window.addEventListener('hashchange',syncRoute);renderGallery();syncRoute();
