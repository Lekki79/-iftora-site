import * as T from 'three';
import {GLTFLoader} from '../vendor/GLTFLoader.js';
const stage=document.querySelector('#stage'),hint=document.querySelector('#hint'),replay=document.querySelector('#replay'),label=document.querySelector('#selection'),poster=document.querySelector('#poster');
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),mobile=matchMedia('(max-width:700px)');
let renderer;
try{renderer=new T.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true})}catch(e){hint.textContent='3D недоступне — показано статичний ракурс';throw e}
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0,0);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
const canvas=renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('aria-label','3D-модель: перетягніть горизонтально або скористайтеся клавішами зі стрілками');stage.append(canvas);
const scene=new T.Scene(),root=new T.Group();scene.add(root);const camera=new T.OrthographicCamera(-5,5,5,-5,.1,100);camera.position.set(7,6,10);camera.lookAt(0,0,0);
scene.add(new T.HemisphereLight(0xffffff,0x55758b,2.5));for(const [p,power] of [[[4,8,6],4],[[-6,3,3],3],[[2,1,-5],3]]){const l=new T.DirectionalLight(0xf1faff,power);l.position.set(...p);scene.add(l)}
let groups=[],meshes=[],amount=0,start=null,raf=0,loaded=false,drag=null,selected=null,lost=false;
const offsets=[1.90,1.20,.60,.1,-.75,-1.70];
const names=['Оптичне вікно','Передня горловина','Плече корпусу','Контактна зона','Основний корпус','Задній інтерфейс'];
function render(){if(!lost)renderer.render(scene,camera)}
function size(){let w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h,false);let height=mobile.matches?8.2:9.3;const aspect=w/h;if(aspect<.65)height*=.65/aspect;camera.left=-height*aspect/2;camera.right=height*aspect/2;camera.top=height/2;camera.bottom=-height/2;camera.updateProjectionMatrix();apply(amount)}
function apply(v){amount=v;groups.forEach((g,i)=>g.position.y=g.userData.baseY+offsets[i]*v*(mobile.matches?.6:1));scene.updateMatrixWorld(true);stage.dataset.amount=v.toFixed(3);render()}
const ease=t=>t*t*t*(t*(6*t-15)+10);
function sample(s){return s<1.2?0:s<3.7?ease((s-1.2)/2.5):s<5?1:s<8?1-ease((s-5)/3):0}
function idle(){stage.dataset.state='idle';hint.textContent=mobile.matches?'Проведіть для обертання · торкніться для виділення':'Перетягніть для обертання · наведіть для виділення';replay.disabled=reduced.matches}
function tick(now){if(start===null)return;let s=(now-start)/1000;apply(sample(s));stage.dataset.state=s<1.2?'assembled':s<3.7?'opening':s<5?'exploded':s<8?'closing':'idle';if(s<8)raf=requestAnimationFrame(tick);else{start=null;idle()}}
function clear(){if(selected)selected.traverse(o=>{if(o.isMesh)for(const m of (Array.isArray(o.material)?o.material:[o.material]))m.emissive.setHex(0)});selected=null;label.textContent=''}
function play(){cancelAnimationFrame(raf);clear();root.rotation.set(0,0,0);apply(0);if(reduced.matches){start=null;idle();return}replay.disabled=true;hint.textContent='';start=performance.now();raf=requestAnimationFrame(tick)}
const ray=new T.Raycaster(),p=new T.Vector2();
function pick(e){const b=canvas.getBoundingClientRect();p.set((e.clientX-b.left)/b.width*2-1,1-(e.clientY-b.top)/b.height*2);ray.setFromCamera(p,camera);let hit=ray.intersectObjects(meshes,false)[0]?.object;clear();if(hit){selected=groups.find(g=>{let n=hit;while(n){if(n===g)return true;n=n.parent}return false});if(selected){selected.traverse(o=>{if(o.isMesh)for(const m of (Array.isArray(o.material)?o.material:[o.material])){m.emissive.setHex(0x087f9f);m.emissiveIntensity=.32}});label.textContent=names[groups.indexOf(selected)]}}render()}
canvas.addEventListener('pointerdown',e=>{if(start!==null||!loaded)return;drag={x:e.clientX,y:e.clientY,total:0,id:e.pointerId};canvas.setPointerCapture(e.pointerId)});
canvas.addEventListener('pointermove',e=>{if(start!==null||!loaded)return;if(drag){let dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.total+=Math.abs(dx)+Math.abs(dy);root.rotation.y=T.MathUtils.clamp(root.rotation.y+dx*.004,-.48,.48);root.rotation.x=T.MathUtils.clamp(root.rotation.x+dy*.002,-.16,.16);drag.x=e.clientX;drag.y=e.clientY;render()}else if(e.pointerType==='mouse')pick(e)});
canvas.addEventListener('pointerup',e=>{if(drag?.total<7)pick(e);drag=null});canvas.addEventListener('pointercancel',()=>drag=null);canvas.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse'&&!drag){clear();render()}});
canvas.addEventListener('keydown',e=>{if(start!==null||!loaded)return;if(e.key.startsWith('Arrow')){e.preventDefault();root.rotation.y=T.MathUtils.clamp(root.rotation.y+(e.key==='ArrowLeft'?-.06:e.key==='ArrowRight'?.06:0),-.48,.48);root.rotation.x=T.MathUtils.clamp(root.rotation.x+(e.key==='ArrowUp'?-.04:e.key==='ArrowDown'?.04:0),-.16,.16);render()}});
replay.onclick=play;new ResizeObserver(size).observe(stage);reduced.addEventListener('change',()=>{cancelAnimationFrame(raf);start=null;apply(0);idle()});mobile.addEventListener('change',size);
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;cancelAnimationFrame(raf);start=null;poster.hidden=false;canvas.hidden=true;replay.disabled=true;hint.textContent='3D недоступне — показано статичний ракурс'});
canvas.addEventListener('webglcontextrestored',()=>{lost=false;canvas.hidden=false;poster.hidden=true;apply(0);idle()});
try{const gltf=await new GLTFLoader().loadAsync('assets/IFTORA_About_C125M.glb');root.add(gltf.scene);gltf.scene.updateMatrixWorld(true);const box=new T.Box3().setFromObject(gltf.scene),center=box.getCenter(new T.Vector3());gltf.scene.position.sub(center);gltf.scene.traverse(o=>{if(/^0[1-6]_/.test(o.name)&&!o.name.endsWith('_surface')&&!o.isMesh){groups.push(o);o.userData.baseY=o.position.y}if(o.isMesh){o.material=Array.isArray(o.material)?o.material.map(m=>m.clone()):o.material.clone();meshes.push(o)}});groups.sort((a,b)=>a.name.localeCompare(b.name));if(groups.length!==6)throw Error('Expected six groups');loaded=true;poster.hidden=true;size();stage.dataset.ready='true';play()}catch(e){canvas.hidden=true;hint.textContent='Не вдалося завантажити 3D — показано статичний ракурс';console.error(e)}
window.aboutPreview={get groups(){return groups},root,camera,renderer,get amount(){return amount},seek(s){cancelAnimationFrame(raf);start=null;apply(sample(s));stage.dataset.state='review';},play};
