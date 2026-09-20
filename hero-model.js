import * as THREE from 'three';
import {GLTFLoader} from './vendor/GLTFLoader.js';
export async function initModel(stage){
 const poster=stage.querySelector('img');poster.hidden=false;stage.dataset.state='loading';
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let renderer;
 try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true})}catch(e){stage.dataset.state='fallback';return {available:false}}
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setClearColor(0,0);stage.append(renderer.domElement);
 const scene=new THREE.Scene(),root=new THREE.Group(),camera=new THREE.OrthographicCamera(-.1,.1,.1,-.1,.001,3);scene.add(root);camera.up.set(0,1,-.30556);
 scene.add(new THREE.HemisphereLight(0xffffff,0x506c80,2.7));for(const [p,i] of [[[.1,.15,.15],3],[[-.12,.03,-.1],2]]){const l=new THREE.DirectionalLight(0xffffff,i);l.position.set(...p);scene.add(l)}
 const spread=()=>innerWidth<701?.6:.7;
 let intro=true,edges=[],outlines=[],volume=1,contextLost=false,loaded=false;
 let baseY=0,baseZ=0;
 let groups=[],value=0,raf=0,anim=null,drag=null,selected=null;
 const offsets={group_05:.072,group_06:.09,group_07:.09,group_08:.09,group_09:.09,group_10:.024,group_11:.048};
 function render(){if(contextLost)return;renderer.render(scene,camera);stage.dispatchEvent(new Event("modelrender"))}
 function resize(){const w=stage.clientWidth,h=stage.clientHeight;if(w<1||h<1||contextLost)return;if(renderer.domElement.width!==Math.floor(w*renderer.getPixelRatio())||renderer.domElement.height!==Math.floor(h*renderer.getPixelRatio()))renderer.setSize(w,h,false);const width=(innerWidth<701?.081:.118)+.10*value*spread();camera.left=-width/2;camera.right=width/2;camera.top=width*h/w/2;camera.bottom=-camera.top;camera.updateProjectionMatrix();render()}
 function apply(t){value=t;for(const g of groups)g.mesh.position.x=g.base+g.offset*t*spread();camera.position.set(-.085+.045*t*spread(),.055,.18);camera.lookAt(.045*t*spread(),0,0);stage.dataset.amount=t.toFixed(3);resize()}
 const ease=t=>t*t*(3-2*t);
 function loop(now){if(!anim)return;let t;if(anim.cycle){const s=(now-anim.start)/1000;t=s<1.5?0:s<3.7?ease((s-1.5)/2.2):s<5?1:s<7.2?1-ease((s-5)/2.2):0;if(s>=7.2)anim=null}else{const f=Math.min(1,(now-anim.start)/1500);t=anim.from+(anim.to-anim.from)*ease(f);if(f===1)anim=null}apply(t);if(anim)raf=requestAnimationFrame(loop)}
 function stop(){cancelAnimationFrame(raf);anim=null}
 function go(target){stop();baseY=baseZ=0;root.rotation.set(0,0,0);if(reduced.matches){apply(target);return}anim={from:value,to:target,start:performance.now()};raf=requestAnimationFrame(loop)}
 function play(){stop();baseY=baseZ=0;root.rotation.set(0,0,0);apply(0);if(!reduced.matches){anim={cycle:true,start:performance.now()};raf=requestAnimationFrame(loop)}}
 const ray=new THREE.Raycaster(),point=new THREE.Vector2();
 function pick(e){const r=renderer.domElement.getBoundingClientRect();point.set((e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2);ray.setFromCamera(point,camera);const hit=ray.intersectObjects(groups.map(g=>g.mesh),false)[0]?.object;if(selected)selected.material.emissive.setHex(0);selected=hit;if(hit){hit.material.emissive.setHex(0x05758b);hit.material.emissiveIntensity=.32}stage.dataset.selected=hit?.name||'';render()}
 const canvas=renderer.domElement;
 canvas.addEventListener('pointerdown',e=>{if(intro)return;stop();drag={id:e.pointerId,x:e.clientX,y:e.clientY,moved:0};canvas.setPointerCapture(e.pointerId);pick(e)});
 canvas.addEventListener('pointermove',e=>{if(intro)return;if(drag&&drag.id===e.pointerId){const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.moved+=Math.abs(dx)+Math.abs(dy);root.rotation.y=THREE.MathUtils.clamp(root.rotation.y+dx*.003,-.32,.32);root.rotation.z=THREE.MathUtils.clamp(root.rotation.z+dy*.002,-.13,.13);baseY=root.rotation.y;baseZ=root.rotation.z;drag.x=e.clientX;drag.y=e.clientY;render()}else if(e.pointerType==='mouse')pick(e)});
 canvas.addEventListener('pointerup',e=>{if(drag?.moved<8)pick(e);drag=null});canvas.addEventListener('pointercancel',()=>drag=null);canvas.addEventListener('pointerleave',()=>{if(!drag&&selected){selected.material.emissive.setHex(0);selected=null;render()}});
 stage.addEventListener('keydown',e=>{if(!intro&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();stop();root.rotation.y=THREE.MathUtils.clamp(root.rotation.y+(e.key==='ArrowLeft'?-.06:.06),-.32,.32);render()}});
 new ResizeObserver(()=>apply(value)).observe(stage);reduced.addEventListener('change',()=>{stop();apply(0)});
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();contextLost=true;stop();canvas.hidden=true;poster.hidden=false;stage.dataset.state='fallback';stage.dispatchEvent(new Event('modelunavailable'))});
 canvas.addEventListener('webglcontextrestored',()=>{contextLost=false;if(!loaded)return;canvas.hidden=false;study(6.5);poster.hidden=true;stage.dataset.state='ready';stage.dispatchEvent(new Event('modelrestored'))});
 try{const gltf=await new GLTFLoader().loadAsync('./assets/real-module.glb');root.add(gltf.scene);gltf.scene.traverse(o=>{if(o.isMesh&&o.name.startsWith('group_')){o.material=o.material.clone();o.material.polygonOffset=true;o.material.polygonOffsetFactor=1;o.material.polygonOffsetUnits=1;o.renderOrder=0;const line=new THREE.LineSegments(new THREE.EdgesGeometry(o.geometry,35),new THREE.LineBasicMaterial({color:0x387c94,transparent:true,opacity:0}));line.renderOrder=2;o.add(line);edges.push(line);if(['group_01','group_05'].includes(o.name)){const silhouette=new THREE.Mesh(o.geometry,new THREE.MeshBasicMaterial({color:0x387c94,side:THREE.BackSide,transparent:true,opacity:0,depthWrite:false}));silhouette.scale.setScalar(1.004);silhouette.renderOrder=1;o.add(silhouette);outlines.push(silhouette)}groups.push({mesh:o,base:o.position.x,offset:offsets[o.name]||0})}});loaded=true;apply(0);if(!contextLost){poster.hidden=true;stage.dataset.state='ready'}stage.dataset.ready='true'}catch(e){canvas.hidden=true;poster.hidden=false;stage.dataset.state='fallback';console.warn('GLB unavailable; using poster',e)}
 function study(t){intro=t<6.5;stop();baseY=baseZ=0;root.rotation.set(0,0,0);const v=ease(THREE.MathUtils.clamp((t-1.8)/1.2,0,1));volume=v;for(const g of groups){g.mesh.material.transparent=v<1;g.mesh.material.opacity=v;g.mesh.material.depthWrite=true;g.mesh.material.colorWrite=v>0}for(const e of edges){e.visible=t<3;e.material.opacity=THREE.MathUtils.clamp(t/.8,0,1)*(1-v);e.position.x=.0005*(1-ease(THREE.MathUtils.clamp((t-1.5)/1.3,0,1)))}for(const o of outlines){o.visible=t<3;o.material.opacity=THREE.MathUtils.clamp(t/.8,0,1)*(1-v)}let amount=t<3?0:t<4.6?ease((t-3)/1.6):t<5?1:t<6.5?1-ease((t-5)/1.5):0;if(innerWidth<701)amount*=.65;apply(amount)}
 function respond(x,y){if(intro||drag||anim||reduced.matches)return;root.rotation.y=THREE.MathUtils.clamp(root.rotation.y*.9+(baseY+x*.025)*.1,-.32,.32);root.rotation.z=THREE.MathUtils.clamp(root.rotation.z*.9+(baseZ+y*.012)*.1,-.13,.13);render()}
 const anchor=new THREE.Vector3();const core=groups[0]?.mesh;if(core){const pos=core.geometry.attributes.position,target=new THREE.Vector3(.004,-.014,.01),v=new THREE.Vector3();let best=Infinity;for(let i=0;i<pos.count;i++){v.fromBufferAttribute(pos,i);const d=v.distanceToSquared(target);if(d<best){best=d;anchor.copy(v)}}}
 function anchorPoint(){if(!core)return null;const v=core.localToWorld(anchor.clone()).project(camera),r=canvas.getBoundingClientRect();return {x:r.left+(v.x+1)*r.width/2,y:r.top+(1-v.y)*r.height/2}}
 const api={available:loaded&&!contextLost,study,respond,anchorPoint,play,go,apply:t=>{stop();baseY=baseZ=0;root.rotation.set(0,0,0);apply(t)},root,groups,renderer,scene,camera};window.heroModel=api;return api;
}
