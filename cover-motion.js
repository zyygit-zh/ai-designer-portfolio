import * as THREE from './vendor/three.module.min.js';
const host=document.querySelector('#home');
const stage=document.querySelector('#cover-stage');
const toggle=document.querySelector('#cover-motion-toggle');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let renderer;
try{
 renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.25)*.85);
 renderer.transmissionResolutionScale=.5;
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.12;
 stage.append(renderer.domElement);
 const scene=new THREE.Scene();
 scene.background=new THREE.Color(0x060709);
 const camera=new THREE.PerspectiveCamera(36,1,.1,100);
 camera.position.set(0,0,8.8);
 const studio=new THREE.Scene();studio.background=new THREE.Color(0x08090c);
 const panel=(w,h,x,y,z,color,intensity)=>{
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color(color).multiplyScalar(intensity),side:THREE.DoubleSide}));
  mesh.position.set(x,y,z);mesh.lookAt(0,0,0);studio.add(mesh);
 };
 panel(3,7,-4,2,2,0xffffff,3);
 panel(1.2,8,4,0,1,0xe9efff,4);
 panel(6,1.4,0,5,1,0xffffff,4);
 panel(2.5,5,0,-3,-4,0x939aaa,1.4);
 panel(1.5,4,-2,0,5,0xffffff,2);
 const pmrem=new THREE.PMREMGenerator(renderer);
 const environment=pmrem.fromScene(studio,.025);
 scene.environment=environment.texture;
 studio.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}});
 pmrem.dispose();
 scene.add(new THREE.AmbientLight(0xffffff,.5));
 const key=new THREE.DirectionalLight(0xffffff,3);key.position.set(-3,4,5);scene.add(key);
 const rim=new THREE.DirectionalLight(0xe6ecff,2.2);rim.position.set(4,-2,3);scene.add(rim);
 const shape=new THREE.Shape();
 [[-1.18,1.65],[1.18,1.65],[1.18,1.15],[-.42,-1.08],[1.18,-1.08],[1.18,-1.65],[-1.18,-1.65],[-1.18,-1.15],[.42,1.08],[-1.18,1.08]].forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();
 const geometry=new THREE.ExtrudeGeometry(shape,{depth:.46,bevelEnabled:true,bevelThickness:.11,bevelSize:.105,bevelSegments:8,steps:1,curveSegments:16});
 geometry.center();
 const glass=new THREE.MeshPhysicalMaterial({color:0xffffff,metalness:0,roughness:.035,transmission:1,thickness:.5,ior:1.38,envMapIntensity:.65,clearcoat:.45,clearcoatRoughness:.04,attenuationColor:0xf3f6ff,attenuationDistance:8});
 const letter=new THREE.Mesh(geometry,glass);scene.add(letter);
 const textRows=[];
 function row(text,y,fontSize,width){
  const canvas=document.createElement('canvas');canvas.width=2048;canvas.height=360;
  const context=canvas.getContext('2d');context.fillStyle='#060709';context.fillRect(0,0,2048,360);
  context.fillStyle='#f3f4f6';context.textAlign='center';context.textBaseline='middle';context.font='900 '+fontSize+'px Arial, sans-serif';
  context.fillText(text,1024,192,1990);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,1.35),new THREE.MeshBasicMaterial({map:texture,toneMapped:false}));
  mesh.position.set(0,y,-2.1);scene.add(mesh);textRows.push(mesh);
 }
 row('AI / VISUAL',.38,252,9.6);
 row('DESIGNER',-.68,282,10.2);
 let running=!reduced.matches,inView=true,frame=0,last=0,time=0;
 let pointer={x:0,y:0},smooth={x:0,y:0};
 function resize(){
  const w=host.clientWidth,h=host.clientHeight;
  renderer.setSize(w,h);camera.aspect=w/h;
  camera.position.z=w<800?10.4:8.8;
  letter.scale.setScalar(w<800?.9:1);
  textRows.forEach((row,i)=>{row.scale.x=w<800?.65:1;});
  camera.updateProjectionMatrix();draw();
 }
 function draw(){
  smooth.x+=(pointer.x-smooth.x)*.035;smooth.y+=(pointer.y-smooth.y)*.035;
  letter.rotation.set(.12+Math.sin(time*.38)*.15+smooth.y*.12,-.32+Math.sin(time*.48)*.64+smooth.x*.3,Math.sin(time*.33)*.075);
  letter.position.y=Math.sin(time*.62)*.13;
  textRows[0].position.x=Math.sin(time*.32)*.75;
  textRows[1].position.x=-Math.sin(time*.32+.45)*.92;
  renderer.render(scene,camera);
  stage.dataset.frame=String(++frame);
 }
 function loop(now){
  if(running&&inView&&!document.hidden){if(last)time+=Math.min((now-last)/1000,.25);draw();}
  last=now;requestAnimationFrame(loop);
 }
 function setRunning(value){running=value;toggle.setAttribute('aria-pressed',String(!value));toggle.setAttribute('aria-label',value?'暂停封面动效':'播放封面动效');toggle.textContent=value?'Ⅱ':'▶';if(!value)draw();}
 toggle.addEventListener('click',()=>setRunning(!running));
 reduced.addEventListener('change',()=>setRunning(!reduced.matches));
 host.addEventListener('pointermove',event=>{if(!running)return;const r=host.getBoundingClientRect();pointer.x=(event.clientX-r.left)/r.width-.5;pointer.y=(event.clientY-r.top)/r.height-.5;},{passive:true});
 host.addEventListener('pointerleave',()=>{pointer.x=0;pointer.y=0;});
 const observer=new IntersectionObserver(([entry])=>{inView=entry.isIntersecting;last=0;},{threshold:.05});observer.observe(host);
 document.addEventListener('visibilitychange',()=>{last=0;});
 new ResizeObserver(resize).observe(host);
 renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();host.classList.remove('motion-ready');toggle.hidden=true;});
 resize();host.classList.add('motion-ready');toggle.hidden=false;setRunning(running);requestAnimationFrame(loop);
}catch(error){console.warn('Glass cover fallback:',error);if(renderer)renderer.dispose();}
