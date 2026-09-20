
const scene=document.querySelector('#scene'), model=document.querySelector('#model');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let realModel;


let start=0, duration=6500, raf=0, ready=false, px=0,py=0,tx=0,ty=0, menuOpen=false;
const smooth=v=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v)};
const leader=document.querySelector('#leader-path'),node=document.querySelector('#leader-node');
function positionLeader(){const p=realModel?.anchorPoint?.();if(!p)return;const box=document.querySelector('#main-phrase').getBoundingClientRect(),origin=scene.getBoundingClientRect(),mobile=innerWidth<701;const x=p.x-origin.left,y=p.y-origin.top,edge=box.right-origin.left,base=box.bottom-origin.top+16;node.setAttribute('cx',x);node.setAttribute('cy',y);leader.setAttribute('d',mobile?`M${x} ${y} L${edge} ${base-24} V${base} H${box.left-origin.left}`:`M${x} ${y} L${edge+36} ${base} H${box.left-origin.left}`);document.querySelector('#leader-start').setAttribute('d','')}

model.addEventListener('modelrender',positionLeader);addEventListener('resize',positionLeader);
function frame(t){scene.dataset.time=t.toFixed(2);ready=t>=6.5;scene.classList.toggle('intro-done',ready);scene.style.setProperty('--engineering',smooth(t/1.5));scene.style.setProperty('--draw',smooth(t/1.5));scene.style.setProperty('--node',smooth((t-5.5)/.15));scene.style.setProperty('--leader',smooth((t-5.65)/.6));scene.style.setProperty('--copy',smooth((t-6.25)/.25));realModel?.study?.(t);positionLeader()}
function run(now){const t=Math.min(6.5,(now-start)/duration*6.5);frame(t);if(t<6.5)raf=requestAnimationFrame(run)}
function replay(){cancelAnimationFrame(raf);px=py=tx=ty=0;scene.style.setProperty('--px',0);scene.style.setProperty('--py',0);if(reduced.matches){frame(6.5);return}duration=innerWidth<701?3800:6500;start=performance.now();frame(0);raf=requestAnimationFrame(run)}
let pointerRaf=0;
function settle(){px+=(tx-px)*.09;py+=(ty-py)*.09;scene.style.setProperty('--px',px);scene.style.setProperty('--py',py);realModel?.respond?.(px,py);if(Math.abs(px-tx)+Math.abs(py-ty)>.002)pointerRaf=requestAnimationFrame(settle);else pointerRaf=0}
scene.addEventListener('pointermove',e=>{if(!ready||reduced.matches||menuOpen||e.pointerType!=='mouse'||e.buttons)return;tx=(e.clientX/innerWidth-.5)*2;ty=(e.clientY/innerHeight-.5)*2;if(!pointerRaf)pointerRaf=requestAnimationFrame(settle)});
scene.addEventListener('pointerleave',()=>{tx=ty=0;if(!pointerRaf&&!reduced.matches)pointerRaf=requestAnimationFrame(settle)});
reduced.addEventListener('change',()=>{cancelAnimationFrame(pointerRaf);pointerRaf=0;replay()});
window.heroMotion={replay,seek:t=>{cancelAnimationFrame(raf);frame(t)}};
const menu=document.querySelector('#menu'),panel=document.querySelector('#menu-panel');let hideTimer;
function toggleMenu(open){clearTimeout(hideTimer);menuOpen=open;menu.setAttribute('aria-expanded',open);menu.setAttribute('aria-label',document.documentElement.lang==='en'?(open?'Close menu':'Open menu'):(open?'Закрити меню':'Відкрити меню'));scene.classList.toggle('menu-open',open);if(open){panel.hidden=false;panel.inert=false;panel.getBoundingClientRect();requestAnimationFrame(()=>{panel.classList.add('open');panel.querySelector('button').focus()})}else{panel.classList.remove('open');panel.inert=true;hideTimer=setTimeout(()=>panel.hidden=true,reduced.matches?0:700);menu.focus()}}
menu.addEventListener('click',()=>toggleMenu(!menuOpen));document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menuOpen)toggleMenu(false);if(e.key==='Tab'&&menuOpen){const items=[menu,...panel.querySelectorAll('button,a')].filter(e=>e.getClientRects().length);let i=items.indexOf(document.activeElement);e.preventDefault();items[(i+(e.shiftKey?-1:1)+items.length)%items.length].focus()}});
// UI/layout must initialize even when the 3D import or model request fails.
function fallback(){scene.dataset.modelState='fallback';cancelAnimationFrame(raf);frame(6.5);model.querySelector('img').hidden=false}
model.addEventListener('modelunavailable',fallback);
model.addEventListener('modelrestored',()=>{scene.dataset.modelState='ready';cancelAnimationFrame(raf);frame(6.5)});
import('./hero-model.js?v=stability-1').then(({initModel})=>initModel(model)).then(api=>{
 realModel=api;
 if(api?.available){scene.dataset.modelState='ready';replay()}else fallback();
}).catch(error=>{console.warn('IFTORA model fallback',error);fallback()});

const words={uk:{phrase:'Від технічної задачі до готового рішення',cta:'Обговорити проєкт',menu:'Меню',replay:'Переглянути рух ще раз',back:'Повернутися до модуля',note:'Зателефонуйте або напишіть нам'},en:{phrase:'From technical challenge to complete solution',cta:'Discuss your project',menu:'Menu',replay:'Watch the motion again',back:'Return to the module',note:'Call or email us'}};
document.querySelectorAll('[data-lang]').forEach(button=>button.addEventListener('click',()=>{const language=button.dataset.lang;document.querySelector('.language').style.setProperty('--lang-offset',(language==='en'?document.querySelector('.language [data-lang=en]').offsetLeft:0)+'px');document.documentElement.lang=language;document.querySelectorAll('[data-lang]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.lang===language));const w=words[language];document.querySelector('#main-phrase').innerHTML=language==='en'?'From technical challenge<br>to complete solution':'Від технічної задачі<br>до готового рішення';renderCTA(w.cta);document.querySelector('.menu-label').textContent=w.menu;document.querySelector('#contact-title').textContent=w.cta;document.querySelector('#contact-close').textContent=w.back;document.querySelector('#contact-note').textContent=w.note;positionLeader();}));
const contactPanel=document.querySelector('#contact-panel');document.body.append(contactPanel);let contactReturn;
function closeContact(){contactPanel.hidden=true;contactPanel.inert=true;(contactReturn||document.querySelector('#contact')).focus()}
let contactOpenTimer;document.querySelector('#contact').addEventListener('click',()=>{
 if(contactOpenTimer)return;contactReturn=document.activeElement;const cta=document.querySelector('#contact');
 const open=()=>{contactOpenTimer=null;cta.classList.remove('is-locked','is-signalling');contactPanel.hidden=false;contactPanel.inert=false;document.querySelector('#contact-close').focus()};
 const lock=()=>{cta.classList.remove('is-signalling');cta.classList.add('is-locked');contactOpenTimer=setTimeout(open,reduced.matches?0:180)};
 if(reduced.matches){lock();return}
 cta.classList.add('is-signalling');contactOpenTimer=setTimeout(lock,340);
});document.querySelector('#contact-close').addEventListener('click',closeContact);document.addEventListener('keydown',e=>{if(!contactPanel.hidden){if(e.key==='Escape')closeContact();if(e.key==='Tab'){const items=[...contactPanel.querySelectorAll('a,button')];const i=items.indexOf(document.activeElement);e.preventDefault();items[(i+(e.shiftKey?-1:1)+items.length)%items.length].focus()}}});

// Reference-based mark and two type treatments in the existing Hero.
const reviewParams=new URLSearchParams(location.search);
document.documentElement.dataset.type=reviewParams.get('type')==='b'?'b':'a';
const referenceMark='<path d="M18 2C10 6 5 12 4 19H13C14 15 15 12 18 10ZM4 21C5 28 10 34 18 38V30C15 28 14 25 13 21Z" fill="currentColor"/><path d="M22 6A14 14 0 0 1 22 34M35 20h3" fill="none" stroke="currentColor" stroke-width="1.8"/>';
const brandMark=document.querySelector('.brand-mark');brandMark.setAttribute('viewBox','0 0 40 40');brandMark.innerHTML=referenceMark;brandMark.removeAttribute('hidden');document.querySelector('.footer-brand .brand-mark').innerHTML=referenceMark;
const icon=document.createElement('link');icon.rel='icon';icon.type='image/svg+xml';icon.href='assets/iftora-reference-mark.svg';document.head.append(icon);
function updateNavigation(){const en=document.documentElement.lang==='en',labels=en?{home:'Home',about:'About',services:'Services',cases:'Cases',faq:'FAQ',contact:'Contact'}:{home:'Головна',about:'Про компанію',services:'Послуги',cases:'Кейси',faq:'FAQ',contact:'Контакти'};document.querySelectorAll('[data-nav]').forEach(b=>b.textContent=labels[b.dataset.nav]);document.querySelectorAll('[data-ua]').forEach(e=>e.textContent=en?e.dataset.en:e.dataset.ua);document.querySelector('#menu-note').hidden=true;document.querySelector('#footer-note').hidden=true}
document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',updateNavigation));
document.querySelectorAll('[data-nav]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.nav==='about'){location.href='./about/?lang='+document.documentElement.lang}else if(b.dataset.nav==='home'){if(menuOpen)toggleMenu(false);scene.scrollIntoView({behavior:reduced.matches?'instant':'smooth'})}else if(b.dataset.nav==='contact'){if(menuOpen)toggleMenu(false);document.querySelector('#home-contact').scrollIntoView({behavior:reduced.matches?'instant':'smooth'})}else{const note=document.querySelector(b.closest('.footer-nav')?'#footer-note':'#menu-note');note.hidden=false;note.textContent=document.documentElement.lang==='en'?'This page is planned for the next site phase':'Цю сторінку заплановано на наступний етап сайту'}}));
document.querySelectorAll('[data-open-contact]').forEach(b=>b.addEventListener('click',()=>document.querySelector('#contact').click()));
scene.addEventListener('pointermove',e=>{if(e.pointerType==='touch'&&ready&&!reduced.matches){scene.style.setProperty('--px',(e.clientX/innerWidth-.5)*.5);scene.style.setProperty('--py',(e.clientY/innerHeight-.5)*.5)}});

// Re-anchor leaders after font metrics and responsive text wrapping settle.
document.fonts.ready.then(positionLeader);new ResizeObserver(positionLeader).observe(document.querySelector("#main-phrase"));

// Approved technical-callout CTA; legacy query choices no longer change its design.
function renderCTA(label){
 const button=document.querySelector('#contact');button.replaceChildren();
 const text=document.createElement('span');text.className='cta-text';text.textContent=label;button.append(text);
 const geometry=document.createElement('span');geometry.className='cta-mechanism';geometry.setAttribute('aria-hidden','true');
 geometry.innerHTML='<svg viewBox="0 0 280 54" preserveAspectRatio="none"><path class="callout-line" d="M18 36H210L235 17H260"/><g class="terminal"><path class="terminal-stem" d="M256 17h10"/><path class="endpoint-extension" d="M266 17h24"/><circle class="callout-node" cx="266" cy="17" r="5"/><path class="node-axis" d="M266 8v4m0 10v4"/></g></svg>' ;button.append(geometry);
}
renderCTA(words[document.documentElement.lang==='en'?'en':'uk'].cta);

// Optical framing of existing pictograms, only at mobile widths.
const directionIcons=[...document.querySelectorAll('.direction-icon')];
const iconFrames=['-2 -2 36 36','0 -1 32 34','0 0 32 32','0 0 34 34','0 -1 32 34'];
function frameIcons(){directionIcons.forEach((icon,i)=>icon.setAttribute('viewBox',innerWidth<=700?iconFrames[i]:'0 0 32 32'))}
frameIcons();addEventListener('resize',frameIcons);

// Navigation-only controls; keep the full-screen menu background as a dismiss surface.
document.querySelector('#menu-close').addEventListener('click',()=>toggleMenu(false));
document.addEventListener('click',e=>{if(menuOpen&&!menu.contains(e.target)&&!panel.contains(e.target))toggleMenu(false)});
const initialLanguage=new URLSearchParams(location.search).get('lang');
if(initialLanguage==='en')document.querySelector('.language [data-lang="en"]').click();
document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>{const u=new URL(location.href);u.searchParams.set('lang',b.dataset.lang);history.replaceState(null,'',u);document.querySelector('#menu-close').setAttribute('aria-label',b.dataset.lang==='en'?'Close menu':'Закрити меню')}));
