'use strict';
(() => {
 const base='assets/sun-snowman/';
 const looks=[['orange','橙色印花 T 恤'],['stripe','细条纹 T 恤'],['pink','粉色字标 T 恤'],['green','军绿色口袋 T 恤'],['yellow','浅黄色拼贴 T 恤'],['white','白色拼接 T 恤'],['green-back','军绿色口袋 T 恤']];
 window.renderCommerceCase=()=>`<article class="process-case pc-kids pc-sun-snowman">
  <header class="pc-hero"><div class="pc-top"><span>SUN SNOWMAN / AI STYLING</span><span>SELECTED WORK</span></div><div class="pc-sun-intro"><p class="pc-eyebrow">太阳雪人 · 童装换装</p><h1>从款式平铺，<br><em>到模特上身。</em></h1><p class="pc-intro">以商品平铺图为参考，延展不同服装的上身效果。</p></div></header>
  <section class="pc-sun-gallery" aria-label="款式平铺与上身效果对照"><div class="pc-kids-pair-list">${looks.map(([key,title])=>`<div class="pc-kids-pair"><figure><figcaption>款式平铺</figcaption><div class="pc-flat-image"><img src="${base+key}-flat.webp" alt="${title}款式平铺图" loading="lazy" decoding="async"></div></figure><figure><figcaption>上身效果</figcaption><div class="pc-model-image"><img src="${base+key}-model.webp" alt="${title}${key==='green-back'?'背面上身效果':' AI 模特上身效果'}" loading="lazy" decoding="async"></div></figure></div>`).join('')}</div></section>
  <footer class="pc-footer"><span>朱雨雨 / AI VISUAL DESIGNER</span><a href="index.html#works">返回作品目录 ↑</a></footer>
 </article>`;
 const target=document.querySelector('[data-commerce-page]');if(target)target.innerHTML=window.renderCommerceCase();
})();
