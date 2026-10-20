import sys, os, json, re, math, io, html, argparse
from pathlib import Path
from PIL import Image, ImageStat, ImageChops
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader

ROOT=Path(__file__).resolve().parents[1]
OUT=Path(os.environ.get('PDF_OUTPUT',str(ROOT/'downloads/portfolio.pdf')))
OUT.parent.mkdir(parents=True,exist_ok=True)
W,H=1440,1018
M=56
BG='#0a0d0b'; PANEL='#111a13'; GREEN='#c2ef9b'; WHITE='#edf4e7'; MUTED='#aeb9a8'; LINE='#33412c'
BASE='https://zyygit-zh.github.io/ai-designer-portfolio/'
pdfmetrics.registerFont(TTFont('CN',r'C:\Windows\Fonts\simhei.ttf'))
pdfmetrics.registerFont(TTFont('EN',r'C:\Windows\Fonts\arial.ttf'))
pdfmetrics.registerFont(TTFont('ENB',r'C:\Windows\Fonts\arialbd.ttf'))
raw=(ROOT/'data.js').read_text(encoding='utf-8')
data=json.loads(raw.split('=',1)[1].strip().rstrip(';'))
projects={p['id']:p for p in data}
visual=['double11-gifts','double11-pink','double11-type','weekend','form','nova','pawpal','city','zegl','socks','beiji']
video=['princess','emotion','product','character','clothing']
site_html=(ROOT/'index.html').read_text(encoding='utf-8')
skills=[]
for block in re.findall(r'<article class="skill-card">([\s\S]*?)</article>',site_html):
    skills.append((html.unescape(re.search(r'<span[^>]*>(.*?)</span>',block)[1]),re.search(r'<h3>(.*?)</h3>',block)[1],re.search(r'<p>(.*?)</p>',block)[1]))
def src(path): return ROOT/path.split('?')[0]

# Each graphic project is curated into one spread. These ranges select whole
# compositions or screen groups rather than paginating the original longboard.
selections={
 'double11-gifts':[(0,1800),(2375,8350)],
 'double11-pink':[(0,820),(1105,3550)],
 'double11-type':[(0,3760)],
 'weekend':[(0,1040),(6640,7680)],
 'form':[(890,2570),(2570,4630)],
 'nova':[(0,1500),(7558,8960)],
 'pawpal':[(0,1540),(2320,3069)],
 'city':[(0,1024),(1024,2048)],
 'zegl':[(3310,4425),(6640,7770)],
 'socks':[(0,1450),(1450,2120)],
 'beiji':[(0,2575),(4715,6872)],
}
starts={id:idx+3 for idx,id in enumerate(visual)}
starts.update({'princess':14,'emotion':16,'product':17,'character':18,'clothing':19})
TOTAL=20
c=canvas.Canvas(str(OUT),pagesize=(W,H),pageCompression=1)
c.setTitle('朱雨雨 | AI / VISUAL DESIGNER | 精选作品集 2026')
c.setAuthor('朱雨雨');c.setSubject('精选平面视觉设计、AI 视频制作、技能与工具')
c.setCreator('Portfolio PDF');page_num=0;manifest=[];placements=[]
def fill(col):c.setFillColor(HexColor(col))
def rect(x,y,w,h,col,r=0,stroke=None):
    fill(col)
    c.setStrokeColor(HexColor(stroke or col));c.setLineWidth(.8)
    if r:c.roundRect(x,H-y-h,w,h,r,fill=1,stroke=bool(stroke))
    else:c.rect(x,H-y-h,w,h,fill=1,stroke=bool(stroke))
def text(txt,x,y,size=18,color=WHITE,font='CN'):
    fill(color);c.setFont(font,size);c.drawString(x,H-y-size*.85,txt)
def wrap(txt,width,size=18,font='CN'):
    lines=[];line=''
    for char in txt:
        if char=='\n':lines.append(line);line='';continue
        if pdfmetrics.stringWidth(line+char,font,size)>width and line:
            lines.append(line);line=char
        else:line+=char
    if line:lines.append(line)
    return lines
def para(txt,x,y,width,size=18,color=MUTED,leading=None,font='CN'):
    lead=leading or size*1.65
    lines=wrap(txt,width,size,font)
    for idx,line in enumerate(lines):text(line,x,y+idx*lead,size,color,font)
    return len(lines)*lead
def image(path,x,y,w,h=None,mode='contain'):
    im=Image.open(path).convert('RGB') if isinstance(path,(str,Path)) else path.convert('RGB')
    if h is None:h=w*im.height/im.width
    if mode=='cover':
        scale=max(w/im.width,h/im.height)
        crop_w,crop_h=w/scale,h/scale
        im=im.crop(((im.width-crop_w)/2,(im.height-crop_h)/2,(im.width+crop_w)/2,(im.height+crop_h)/2))
    else:
        scale=min(w/im.width,h/im.height);nw,nh=im.width*scale,im.height*scale
        x+=(w-nw)/2;y+=(h-nh)/2;w,h=nw,nh
    im.thumbnail((max(1,round(w*2.2)),max(1,round(h*2.2))),Image.Resampling.LANCZOS)
    buf=io.BytesIO();im.save(buf,format='JPEG',quality=85,subsampling=0,optimize=True)
    c.drawImage(ImageReader(buf),x,H-y-h,width=w,height=h)
    return (x,y,w,h)
def link(url,x,y,w,h):c.linkURL(url,(x,H-y-h,x+w,H-y),relative=0,thickness=0)
def begin(label,key=None,outline=None):
    global page_num
    page_num+=1;rect(0,0,W,H,BG)
    text('ZHU YUYU / PORTFOLIO 2026',M,28,10,MUTED,'EN')
    text(label,W-M-244,28,10,GREEN,'EN')
    text('朱雨雨',M,H-43,11,MUTED)
    text(f'{page_num:02d} / {TOTAL:02d}',W-M-52,H-43,10,MUTED,'EN')
    c.setStrokeColor(HexColor(LINE));c.line(M,62,W-M,62)
    if key:
        c.bookmarkPage(key)
        if outline:c.addOutlineEntry(outline,key,0,False)
    manifest.append({'page':page_num,'section':label,'key':key})
def end():c.showPage()
def title(label,heading,desc=None):
    text(label,M,90,11,GREEN,'EN')
    text(heading,M,118,44,WHITE)
    if desc:para(desc,M,177,1180,18)
def button(label,url,x,y,w=248):
    rect(x,y,w,54,GREEN,27)
    text(label,x+22,y+17,17,BG)
    text('>',x+w-30,y+17,17,BG,'ENB')
    link(url,x,y,w,54)


def selected(id,range):
 im=Image.open(src(projects[id]['longImages'][0]['src'])).convert('RGB')
 top,bottom=range
 assert 0<=top<bottom<=im.height,(id,range)
 return im.crop((0,top,im.width,bottom))
def place(im,x,y,w,h,mode='contain'):
 box=image(im,x,y,w,h,mode)
 assert box[0]>=0 and box[1]>=0 and box[0]+box[2]<=W+.01 and box[1]+box[3]<=H-65,(page_num,box)
 placements.append({'page':page_num,'box':box})
 return box
def project_link(id):
 text('查看完整项目  >',W-M-145,177,16,GREEN)
 link(BASE+'#project/'+id,W-M-150,169,150,35)
def pair(ims):
 height=690;gap=24;available=W-2*M-gap
 ratios=[im.width/im.height for im in ims]
 height=min(height,available/sum(ratios))
 widths=[height*r for r in ratios]
 x=(W-sum(widths)-gap)/2;y=218+(690-height)/2
 for im,w in zip(ims,widths):
  place(im,x,y,w,height);x+=w+gap

begin('AI / VISUAL DESIGNER','cover','封面')
text('SELECTED WORKS / 2026',M,128,14,GREEN,'EN')
text('PORTFOLIO',M,164,78,WHITE,'ENB')
place(ROOT/'assets/pdf/cover-still.png',0,277,W,537,'cover')
rect(W-96,279,84,60,'#08090b')
text('朱雨雨',M,847,48,WHITE)
text('平面视觉设计 / AI 视频制作',M+235,870,22,MUTED)
button('查看在线作品集',BASE+'#works',W-M-286,861,286)
end()

begin('CONTENTS','contents','作品目录')
text('作品目录',M,91,39,WHITE);text('CONTENTS',M+215,109,16,GREEN,'EN')
text('01 / 平面视觉设计',M,153,18,GREEN)
cardw=(W-2*M-48)/4;cardh=156
for idx,id in enumerate(visual):
 p=projects[id];x=M+(idx%4)*(cardw+16);y=188+(idx//4)*(cardh+16)
 rect(x,y,cardw,cardh,PANEL,12,LINE)
 image(src(p['cover']),x+10,y+10,112,cardh-20,mode='cover')
 para(p['title'],x+136,y+35,cardw-146,18,WHITE,26)
 text(f'{idx+1:02d} / P.{starts[id]:02d}',x+136,y+113,11,GREEN,'EN')
 c.linkRect('',id,(x,H-y-cardh,x+cardw,H-y),relative=0,thickness=0)
text('02 / AI 视频制作',M,726,18,GREEN)
cardw=(W-2*M-64)/5;cardh=144
for idx,id in enumerate(video):
 p=projects[id];x=M+idx*(cardw+16);y=762
 rect(x,y,cardw,cardh,PANEL,12,LINE)
 image(src(p['cover']),x+10,y+10,cardw-20,76,mode='cover')
 text(p['title'],x+12,y+97,16,WHITE)
 text(f'P.{starts[id]:02d}',x+cardw-46,y+121,10,GREEN,'EN')
 c.linkRect('',id,(x,H-y-cardh,x+cardw,H-y),relative=0,thickness=0)
text('技能与工具 / 联系   P.20',W-M-241,937,15,MUTED)
c.linkRect('','skills',(W-M-245,H-959,W-M,H-929),relative=0,thickness=0)
end()

for idx,id in enumerate(visual):
 p=projects[id];begin('GRAPHIC & VISUAL DESIGN',id,p['title'])
 title(f'{idx+1:02d} / GRAPHIC & VISUAL DESIGN',p['title'],p['subtitle'])
 project_link(id)
 ims=[selected(id,r) for r in selections[id]]
 if id=='socks':
  place(ims[0],M,218,632,690)
  place(ims[1],M+684,218,644,304)
  text('批量制作小工具 / 使用 Vibe Coding 制作',M+684,559,20,GREEN)
  place(src(p['longImages'][1]['src']),M+684,598,644,310)
 else:pair(ims)
 end()

p=projects['princess']
begin('AI VIDEO / PRODUCTION','princess',p['title'])
title('01 / AI VIDEO PRODUCTION','《公主请自重》','制作过程')
place(src(p['productionImages'][0]['src']),M,226,915,677)
rect(1007,226,377,677,PANEL,16,LINE)
text('角色与场景设定',1035,267,28,WHITE)
para('统一人物面貌、发饰与服装，搭建雪景、楼阁、内室等环境。',1035,327,319,21,MUTED,34)
text('镜头与动态生成',1035,461,28,WHITE)
para('将美术资源对应到具体镜头，生成动态片段，再完成修图与调色。',1035,520,319,21,MUTED,34)
text('风格与画面衔接',1035,655,28,WHITE)
para('保持人物造型、冷暖光线和视觉氛围的一致。',1035,712,319,21,MUTED,34)
button('查看制作过程原图',BASE+p['productionImages'][0]['src'],1035,823,313)
end()

for idx,id in enumerate(video):
 p=projects[id];begin('AI VIDEO / SELECTED FRAMES',id if id!='princess' else 'princess-video',p['title'] if id!='princess' else '公主请自重 · 视频')
 title(f'{idx+1:02d} / AI VIDEO PRODUCTION',p['title'],p['subtitle'] if id!='clothing' else '虚拟童模 / 动态换装')
 if id=='clothing':
  place(src(p['cover']),M+86,221,422,645)
  place(ROOT/'assets/pdf/clothing-frame.jpg',M+547,221,422,645)
  rect(1090,221,294,645,PANEL,16,LINE)
  text('动态换装展示',1117,268,26,WHITE)
  para('服装参考 / 虚拟童模 / 动作生成 / 系列视觉',1117,328,240,21,MUTED,35)
  for j,(f,label,poster) in enumerate(p['videos']):
   y=600+j*125
   para(label,1117,y,242,21,WHITE,32)
   button('观看视频',BASE+f,1117,y+47,242)
 elif id=='character':
  frames=[Image.open(src(f)).convert('RGB') for f in ['assets/film-5-2.webp','assets/film-5-3.webp','assets/film-5-5.webp']]
  ratios=[im.width/im.height for im in frames];height=min(645,(W-2*M-48)/sum(ratios))
  x=(W-sum(ratios)*height-48)/2
  for im,r in zip(frames,ratios):
   place(im,x,222,r*height,height);x+=r*height+24
 else:
  place(src(p['cover']),M,226,1030,580)
  ims=[v[0] for s in p['sections'] for v in s['images']]
  if id=='princess':ims=['assets/film-2-1.webp','assets/film-2-4.webp','assets/film-2-5.webp']
  ims=list(dict.fromkeys(ims))[:3]
  for j,f in enumerate(ims):place(src(f),M+1054,226+j*196,274,184)
 button('点击观看视频',BASE+'#project/'+id+'/video',M,874,278)
 if id!='clothing':
  for j,(f,label,poster) in enumerate(p['videos']):
   text(label+'  >',M+310,893+j*30,16,MUTED)
   link(BASE+f,M+310,882+j*30,970,35)
 end()

begin('SKILLS & TOOLS / CONTACT','skills','技能与工具 / 联系')
title('SKILLS','技能与工具','从视觉设计到 AI 影像，连接创意、制作与工具。')
cardw=(W-2*M-40)/3;cardh=239
for idx,(num,name,body) in enumerate(skills):
 x=M+(idx%3)*(cardw+20);y=239+(idx//3)*(cardh+20)
 rect(x,y,cardw,cardh,PANEL,16,LINE)
 text(num,x+25,y+24,11,GREEN,'EN')
 text(name,x+25,y+65,29,WHITE)
 para(body,x+25,y+122,cardw-50,20,MUTED,32)
rect(M,791,W-2*M,142,PANEL,16,LINE)
text('LET’S CREATE.',M+25,814,29,WHITE,'ENB')
text('朱雨雨 / 杭州 / AI 视觉设计师',M+25,878,18,MUTED)
text('zyy1731333390@gmail.com',M+480,836,27,GREEN,'EN')
link('mailto:zyy1731333390@gmail.com',M+477,827,520,55)
button('在线作品集',BASE,W-M-255,835,230)
end()
assert page_num==TOTAL,(page_num,TOTAL)
c.save()
qa=Path(os.environ.get('PDF_QA_DIR',str(ROOT/'tmp/pdfs')));qa.mkdir(parents=True,exist_ok=True)
(qa/'manifest.json').write_text(json.dumps({'pages':TOTAL,'starts':starts,'pageManifest':manifest,'selections':selections,'placements':placements},ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'pages':TOTAL,'bytes':OUT.stat().st_size,'output':str(OUT)},ensure_ascii=False))

