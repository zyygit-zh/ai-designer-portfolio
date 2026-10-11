import sys, os, json, re, math, io, html, argparse
from pathlib import Path
from PIL import Image, ImageStat, ImageChops
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'downloads/portfolio.pdf'
W,H=960,1358
M=48
BG='#0a0d0b'; PANEL='#111a13'; GREEN='#c2ef9b'; WHITE='#edf4e7'; MUTED='#aeb9a8'; LINE='#33412c'
BASE='https://zyygit-zh.github.io/ai-designer-portfolio/'
pdfmetrics.registerFont(TTFont('CN',r'C:\Windows\Fonts\simhei.ttf'))
pdfmetrics.registerFont(TTFont('EN',r'C:\Windows\Fonts\arial.ttf'))
pdfmetrics.registerFont(TTFont('ENB',r'C:\Windows\Fonts\arialbd.ttf'))
raw=(ROOT/'data.js').read_text(encoding='utf-8')
data=json.loads(raw.split('=',1)[1].strip().rstrip(';'))
projects={p['id']:p for p in data}
visual=['orbit','launch','still','weekend','between','form','nova','pawpal','city','zegl','socks','beiji']
video=['princess','emotion','product','character','clothing']
site_html=(ROOT/'index.html').read_text(encoding='utf-8')
skills=[]
for block in re.findall(r'<article class="skill-card">([\s\S]*?)</article>',site_html):
    skills.append((html.unescape(re.search(r'<span[^>]*>(.*?)</span>',block)[1]),re.search(r'<h3>(.*?)</h3>',block)[1],re.search(r'<p>(.*?)</p>',block)[1]))
def src(path): return ROOT/path.split('?')[0]
def splits(path):
    im=Image.open(path).convert('RGB')
    capacity=int((H-218)*im.width/(W-2*M))
    n=math.ceil(im.height/capacity)
    small=im.resize((64,im.height))
    cuts=[0]; top=0
    for idx in range(n-1):
        desired=top+round((im.height-top)/(n-idx))
        radius=int(capacity*.12)
        low=max(top+int(capacity*.45),desired-radius,im.height-capacity*(n-idx-1))
        high=min(top+capacity,desired+radius,im.height-1)
        assert low<=high,(path,low,high)
        best=(float('inf'),low)
        for y in range(low,high,4):
            band=small.crop((0,max(0,y-3),64,min(im.height,y+3)))
            stat=ImageStat.Stat(band)
            variation=sum(stat.stddev)/3
            diff=ImageStat.Stat(ImageChops.difference(small.crop((0,y-1,64,y)),small.crop((0,y,64,y+1)))).mean
            score=variation+sum(diff)/3+abs(y-desired)/max(radius,1)*3
            if score<best[0]:best=(score,y)
        top=best[1];cuts.append(top)
    cuts.append(im.height)
    parts=list(zip(cuts,cuts[1:]))
    assert all(0<b-a<=capacity for a,b in parts),(path,parts,capacity)
    return parts
segments={id:splits(src(projects[id]['longImages'][0]['src'])) for id in visual}
starts={}; page=4
for id in visual:
    starts[id]=page
    page+=len(segments[id])+(1 if id=='socks' else 0)
video_start=page
for id in video:
    starts[id]=page
    page+=2 if id=='princess' else 1
skills_page=page;contact_page=page+1
TOTAL=contact_page
c=canvas.Canvas(str(OUT),pagesize=(W,H),pageCompression=1)
c.setTitle('朱雨雨 | AI / VISUAL DESIGNER | 作品集 2026')
c.setAuthor('朱雨雨')
c.setSubject('平面视觉设计、AI 视频制作、技能与工具')
c.setCreator('Portfolio PDF')
page_num=0; manifest=[]
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
    buf=io.BytesIO();im.save(buf,format='JPEG',quality=88,subsampling=0,optimize=True)
    c.drawImage(ImageReader(buf),x,H-y-h,width=w,height=h)
    return (x,y,w,h)
def link(url,x,y,w,h):c.linkURL(url,(x,H-y-h,x+w,H-y),relative=0,thickness=0)
def begin(label,key=None,outline=None):
    global page_num
    page_num+=1;rect(0,0,W,H,BG)
    text('ZHU YUYU / PORTFOLIO 2026',M,28,10,MUTED,'EN')
    text(label,690,28,10,GREEN,'EN')
    text('朱雨雨',M,H-43,11,MUTED)
    text(f'{page_num:02d} / {TOTAL:02d}',W-M-52,H-43,10,MUTED,'EN')
    c.setStrokeColor(HexColor(LINE));c.line(M,62,W-M,62)
    if key:
        c.bookmarkPage(key)
        if outline:c.addOutlineEntry(outline,key,0,False)
    manifest.append({'page':page_num,'section':label,'key':key})
def end():c.showPage()
def title(label,heading,desc=None):
    text(label,M,102,11,GREEN,'EN')
    text(heading,M,135,48,WHITE)
    if desc:para(desc,M,206,820,18)
def button(label,url,x,y,w=248):
    rect(x,y,w,54,GREEN,27)
    text(label,x+22,y+17,17,BG)
    text('>',x+w-30,y+17,17,BG,'ENB')
    link(url,x,y,w,54)

begin('AI / VISUAL DESIGNER','cover','封面')
text('SELECTED WORKS',M,164,14,GREEN,'EN')
text('PORTFOLIO',M,216,84,WHITE,'ENB')
image(ROOT/'assets/pdf/cover-still.png',0,407,W,478,mode='cover')
# The PDF presents the artwork without the website's pause control.
rect(W-76,413,65,53,'#08090b')
text('朱雨雨',M,991,58,WHITE)
text('平面视觉设计 / AI 视频制作',M,1082,24,MUTED)
button('查看在线作品集',BASE+'#works',M,1174,286)
text('2026',W-M-100,1190,34,GREEN,'EN')
end()

begin('CONTENTS / GRAPHIC DESIGN','visual-index','平面视觉设计目录')
title('01 / GRAPHIC & VISUAL DESIGN','平面视觉设计','品牌、平面、插画与 AI 创作界面。')
cardw=(W-2*M-32)/3;cardh=230
for idx,id in enumerate(visual):
    p=projects[id];col=idx%3;row=idx//3;x=M+col*(cardw+16);y=288+row*(cardh+18)
    rect(x,y,cardw,cardh,PANEL,16,LINE)
    image(src(p['cover']),x+12,y+12,cardw-24,125,mode='cover')
    text(f'{idx+1:02d}',x+15,y+154,11,GREEN,'EN')
    para(p['title'],x+15,y+176,cardw-30,16,WHITE,22)
    text(f'P.{starts[id]:02d}',x+cardw-57,y+154,11,MUTED,'EN')
    c.linkRect('',id,(x,H-y-cardh,x+cardw,H-y),relative=0,thickness=0)
end()

begin('CONTENTS / AI VIDEO','video-index','AI 视频制作目录')
title('02 / AI VIDEO PRODUCTION','AI 视频制作','影视叙事、产品广告、角色与虚拟童模。')
cardw=(W-2*M-20)/2;cardh=279
for idx,id in enumerate(video):
    p=projects[id];x=M+(idx%2)*(cardw+20);y=295+(idx//2)*(cardh+20)
    rect(x,y,cardw,cardh,PANEL,16,LINE)
    image(src(p['cover']),x+14,y+14,cardw-28,165,mode='cover')
    text(f'{idx+1:02d}',x+18,y+199,12,GREEN,'EN')
    text(p['title'],x+18,y+223,22,WHITE)
    text(f'P.{starts[id]:02d}',x+cardw-65,y+199,12,MUTED,'EN')
    c.linkRect('',id,(x,H-y-cardh,x+cardw,H-y),relative=0,thickness=0)
text('SKILLS & TOOLS',M+cardw+20,1198,13,GREEN,'EN')
text(f'技能与工具   P.{skills_page:02d}',M+cardw+20,1226,22)
end()

coverage=[]
for idx,id in enumerate(visual):
    p=projects[id];im=Image.open(src(p['longImages'][0]['src'])).convert('RGB')
    n=len(segments[id])
    for part,(top,bottom) in enumerate(segments[id]):
        begin('GRAPHIC & VISUAL DESIGN',id if part==0 else None,p['title'] if part==0 else None)
        text(f'{idx+1:02d} / {p["title"]}',M,87,26,WHITE)
        text(f'{part+1:02d} / {n:02d}',W-M-58,95,11,GREEN,'EN')
        crop=im.crop((0,top,im.width,bottom))
        assert 150+crop.height*(W-2*M)/crop.width<=H-68,(id,part)
        image(crop,M,150,W-2*M)
        coverage.append({'id':id,'page':page_num,'top':top,'bottom':bottom,'width':im.width,'height':im.height})
        end()
    if id=='socks':
        begin('WORKFLOW / VIBE CODING')
        title('11 / SOCKS DESIGN WORKFLOW','批量制作小工具','使用 Vibe Coding 制作')
        image(src(p['longImages'][1]['src']),M,328,W-2*M)
        button('查看项目',BASE+'#project/socks',M,1114)
        end()

for idx,id in enumerate(video):
    p=projects[id];route=BASE+'#project/'+id+'/video'
    if id=='princess':
        begin('AI VIDEO / PRODUCTION',id,p['title'])
        title('01 / AI VIDEO PRODUCTION','《公主请自重》','制作过程')
        image(src(p['productionImages'][0]['src']),M,295,W-2*M)
        para(p['productionDescription'],M,989,W-2*M,20,leading=34)
        button('查看制作过程原图',BASE+'assets/production/princess-node-map.png',M,1187,302)
        end()
    begin('AI VIDEO / SELECTED FRAMES',id if id!='princess' else None,p['title'] if id!='princess' else None)
    title(f'{idx+1:02d} / AI VIDEO PRODUCTION',p['title'],p['subtitle'] if id!='clothing' else '虚拟童模 / 动态换装')
    if id=='clothing':
        image(src(p['cover']),M,289,424,749,mode='contain')
        image(ROOT/'assets/pdf/clothing-frame.jpg',M+448,289,416,749,mode='contain')
    else:
        image(src(p['cover']),M,286,W-2*M,486,mode='cover')
        ims=[v[0] for s in p['sections'] for v in s['images']]
        if id=='princess':ims=['assets/film-2-1.webp','assets/film-2-4.webp','assets/film-2-5.webp']
        ims=list(dict.fromkeys(ims))[:3]
        iw=(W-2*M-28)/3
        for j,f in enumerate(ims):image(src(f),M+j*(iw+14),794,iw,186,mode='cover')
    if id=='clothing':
        text('红色外套动态展示 / 黄色外套动态展示',M,1075,18,MUTED)
    else:
        text('SELECTED FRAMES',M,1014,12,GREEN,'EN')
        text('视频展示',M,1058,30,WHITE)
    button('点击观看视频',route,M,1154,284)
    # Every supplied clip remains directly accessible.
    for j,(f,label,poster) in enumerate(p['videos']):
        y=1233+j*30
        text(label+'  >',M,y,14,MUTED)
        link(BASE+f,M,y,W-2*M,25)
    end()

begin('SKILLS & TOOLS','skills','技能与工具')
title('SKILLS','技能与工具','从视觉设计到 AI 影像，连接创意、制作与工具。')
cardw=(W-2*M-24)/2;cardh=277
for idx,(num,name,body) in enumerate(skills):
    x=M+(idx%2)*(cardw+24);y=310+(idx//2)*(cardh+24)
    rect(x,y,cardw,cardh,PANEL,18,LINE)
    text(num,x+26,y+28,10,GREEN,'EN')
    text(name,x+26,y+78,29,WHITE)
    para(body,x+26,y+137,cardw-52,20,MUTED,32)
end()

begin("LET'S CONNECT",'contact','联系')
text("LET'S",M,200,109,WHITE,'ENB')
text('CREATE.',M,321,109,WHITE,'ENB')
rect(M,526,85,7,GREEN,3)
text('一起做出更好的画面',M,591,30,MUTED)
text('朱雨雨',M,810,42,WHITE)
text('杭州 / AI 视觉设计师',M,880,20,MUTED)
text('zyy1731333390@gmail.com',M,975,32,GREEN,'EN')
link('mailto:zyy1731333390@gmail.com',M,970,800,55)
button('查看在线作品集',BASE,M,1093,294)
text('平面视觉设计 / AI 视频制作',M,1205,20,MUTED)
end()
assert page_num==TOTAL,(page_num,TOTAL)
c.save()
manifest_path=Path(os.environ.get('PDF_QA_DIR',str(ROOT/'tmp/pdfs')))
manifest_path.mkdir(parents=True,exist_ok=True)
(manifest_path/'manifest.json').write_text(json.dumps({'pages':TOTAL,'starts':starts,'skillsPage':skills_page,'contactPage':contact_page,'coverage':coverage,'pageManifest':manifest},ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'pages':TOTAL,'bytes':OUT.stat().st_size,'output':str(OUT),'manifest':str(manifest_path/'manifest.json')},ensure_ascii=False))
