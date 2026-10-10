import * as THREE from './vendor/three.module.min.js';

const host = document.querySelector('#home');
const stage = document.querySelector('#cover-stage');
const toggle = document.querySelector('#cover-motion-toggle');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let renderer;

try {
 await document.fonts.load('400px CoverDisplay');
 renderer = new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.25));
 renderer.transmissionResolutionScale = .85;
 renderer.outputColorSpace = THREE.SRGBColorSpace;
 renderer.toneMapping = THREE.ACESFilmicToneMapping;
 renderer.toneMappingExposure = 1.05;
 stage.append(renderer.domElement);

 const scene = new THREE.Scene();
 scene.background = new THREE.Color(0x060709);
 const camera = new THREE.PerspectiveCamera(36,1,.1,100);
 const studio = new THREE.Scene();
 studio.background = new THREE.Color(0x151517);
 function panel(w,h,x,y,z,intensity) {
  const material = new THREE.MeshBasicMaterial({color:new THREE.Color(0xffffff).multiplyScalar(intensity),side:THREE.DoubleSide});
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w,h),material);
  mesh.position.set(x,y,z); mesh.lookAt(0,0,0); studio.add(mesh);
 }
 // Neutral studio cards produce sharp white reflections without tinting the glass.
 panel(3.5,6,-4,1,3,4);
 panel(1.4,7,4,0,2,5);
 panel(5,1.2,0,5,1,4);
 panel(3,5,-1,-1,-5,3);
 panel(6,.6,0,-4,2,3);
 panel(.65,5,1.8,1,5,3);
 const pmrem = new THREE.PMREMGenerator(renderer);
 const environment = pmrem.fromScene(studio,.01);
 scene.environment = environment.texture;
 studio.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}});
 pmrem.dispose();
 scene.add(new THREE.AmbientLight(0xffffff,.3));
 const key = new THREE.DirectionalLight(0xffffff,2);
 key.position.set(-3,4,5); scene.add(key);

 const outline = [[-1.13,1.55],[1.13,1.55],[1.13,1.18],[-.51,-1.18],[1.13,-1.18],[1.13,-1.55],[-1.13,-1.55],[-1.13,-1.18],[.51,1.18],[-1.13,1.18]];
 const shape = new THREE.Shape();
 outline.forEach((corner,i)=>{
  const previous=outline[(i+outline.length-1)%outline.length],next=outline[(i+1)%outline.length];
  const before=Math.hypot(previous[0]-corner[0],previous[1]-corner[1]);
  const after=Math.hypot(next[0]-corner[0],next[1]-corner[1]);
  const radius=Math.min(.12,before*.3,after*.3);
  const enter=corner.map((v,n)=>v+(previous[n]-v)*radius/before);
  const leave=corner.map((v,n)=>v+(next[n]-v)*radius/after);
  if(i)shape.lineTo(...enter);else shape.moveTo(...enter);
  shape.quadraticCurveTo(...corner,...leave);
 });
 shape.closePath();
 const contour=shape.extractPoints(8).shape.map(p=>[p.x,p.y]);
 const base = new THREE.ExtrudeGeometry(shape,{depth:.64,bevelEnabled:true,bevelThickness:.2,bevelSize:.17,bevelSegments:12,steps:1,curveSegments:8});
 base.center();

 // Subdivide the broad front/back surfaces into a subtle convex lens.
 // Changing their normals creates moving internal refraction, rather than flat gray faces.
 const vertices=[],indices=[],vertexMap=new Map();
 const positions=base.attributes.position;
 function distanceToContour(x,y) {
  let nearest=Infinity;
  for(let i=0;i<contour.length;i++){
   const a=contour[i],b=contour[(i+1)%contour.length];
   const dx=b[0]-a[0],dy=b[1]-a[1];
   if(dx*dx+dy*dy<1e-10)continue;
   const t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy)));
   nearest=Math.min(nearest,Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy));
  }
  return nearest;
 }
 function vertex(p,lens) {
  let [x,y,z]=p;
  if(lens) {
   const d=Math.min(distanceToContour(x,y)/.2,1);
   z+=Math.sign(z)*.16*Math.sin(d*Math.PI/2)**2;
  }
  const id=x.toFixed(5)+','+y.toFixed(5)+','+z.toFixed(5);
  if(!vertexMap.has(id)){vertexMap.set(id,vertices.length/3);vertices.push(x,y,z);}
  return vertexMap.get(id);
 }
 function split(a,b,c,depth) {
  if(!depth){indices.push(vertex(a,true),vertex(b,true),vertex(c,true));return;}
  const mid=(p,q)=>p.map((v,i)=>(v+q[i])/2);
  const ab=mid(a,b),bc=mid(b,c),ca=mid(c,a);
  split(a,ab,ca,depth-1);split(ab,b,bc,depth-1);split(ca,bc,c,depth-1);split(ab,bc,ca,depth-1);
 }
 for(const group of base.groups){
  for(let i=group.start;i<group.start+group.count;i+=3){
   const p=[0,1,2].map(n=>[positions.getX(i+n),positions.getY(i+n),positions.getZ(i+n)]);
   if(group.materialIndex===0)split(...p,4);
   else indices.push(...p.map(v=>vertex(v,false)));
  }
 }
 const geometry=new THREE.BufferGeometry();
 geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
 geometry.setIndex(indices);geometry.computeVertexNormals();base.dispose();

 const glass = new THREE.MeshPhysicalMaterial({
  color:0xffffff,metalness:0,transmission:1,roughness:.025,
  thickness:1.35,ior:1.58,dispersion:4.5,
  envMapIntensity:1.3,clearcoat:.15,clearcoatRoughness:.025,
  attenuationColor:0xffffff,attenuationDistance:Infinity,
  iridescence:.7,iridescenceIOR:1.45,iridescenceThicknessRange:[180,400]
 });
 const letter=new THREE.Mesh(geometry,glass);scene.add(letter);

 const textRows=[];
 function row(text,y,width) {
  const canvas=document.createElement('canvas');canvas.width=2048;canvas.height=512;
  const context=canvas.getContext('2d');
  context.fillStyle='#060709';context.fillRect(0,0,2048,512);
  context.fillStyle='#efefeb';context.textAlign='center';context.textBaseline='middle';
  context.font='400 420px CoverDisplay, sans-serif';
  context.fillText(text,1024,270,1990);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,1.85),new THREE.MeshBasicMaterial({map:texture,toneMapped:false}));
  mesh.position.set(0,y,-1.7);scene.add(mesh);textRows.push(mesh);
 }
 row('AI / VISUAL',.92,10.6);
 row('DESIGNER',-.86,10.9);

 let running=!reduced.matches,inView=true,frame=0,last=0,time=0;
 const pointer={x:0,y:0},smooth={x:0,y:0};
 function draw(){
  smooth.x+=(pointer.x-smooth.x)*.035;smooth.y+=(pointer.y-smooth.y)*.035;
  letter.rotation.set(.17+Math.sin(time*.48)*.28+smooth.y*.12,-.48+Math.sin(time*.42)*.95+smooth.x*.26,Math.sin(time*.38)*.24);
  letter.position.y=Math.sin(time*.52)*.055;
  textRows[0].position.x=Math.sin(time*.25)*.3;
  textRows[1].position.x=-Math.sin(time*.25+.4)*.35;
  renderer.render(scene,camera);stage.dataset.frame=String(++frame);
 }
 function resize(){
  const w=host.clientWidth,h=host.clientHeight,mobile=w<800;
  renderer.setSize(w,h);camera.aspect=w/h;camera.position.set(0,0,mobile?9.1:8.5);
  letter.scale.setScalar(mobile?1.13:1.16);
  textRows.forEach(row=>{row.scale.x=mobile?.63:1;});
  camera.updateProjectionMatrix();draw();
 }
 function loop(now){
  if(running&&inView&&!document.hidden){if(last)time+=Math.min((now-last)/1000,.1);draw();}
  last=now;requestAnimationFrame(loop);
 }
 function setRunning(value){
  running=value;
  toggle.setAttribute('aria-pressed',String(!value));
  toggle.setAttribute('aria-label',value?'暂停封面动效':'播放封面动效');
  toggle.textContent=value?'Ⅱ':'▶';if(!value)draw();
 }
 toggle.addEventListener('click',()=>setRunning(!running));
 reduced.addEventListener('change',()=>setRunning(!reduced.matches));
 host.addEventListener('pointermove',event=>{
  if(!running)return;const r=host.getBoundingClientRect();
  pointer.x=(event.clientX-r.left)/r.width-.5;pointer.y=(event.clientY-r.top)/r.height-.5;
 },{passive:true});
 host.addEventListener('pointerleave',()=>{pointer.x=0;pointer.y=0;});
 new IntersectionObserver(([entry])=>{inView=entry.isIntersecting;last=0;},{threshold:.05}).observe(host);
 document.addEventListener('visibilitychange',()=>{last=0;});
 new ResizeObserver(resize).observe(host);
 renderer.domElement.addEventListener('webglcontextlost',event=>{
  event.preventDefault();host.classList.remove('motion-ready');toggle.hidden=true;
 });
 resize();host.classList.add('motion-ready');toggle.hidden=false;
 setRunning(running);requestAnimationFrame(loop);
}catch(error){
 console.warn('Glass cover fallback:',error);
 if(renderer)renderer.dispose();
}
