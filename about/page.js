const dialog=document.querySelector('#menu-dialog'),menu=document.querySelector('#menu');
menu.onclick=()=>{dialog.showModal();menu.setAttribute('aria-expanded','true')};
document.querySelector('#close-menu').onclick=()=>dialog.close();
dialog.addEventListener('close',()=>{menu.setAttribute('aria-expanded','false');menu.focus()});
dialog.querySelectorAll('a').forEach(a=>a.onclick=()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog){const b=dialog.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)dialog.close()}});
const bilingual=[...document.querySelectorAll('[data-en]')];bilingual.forEach(e=>e.dataset.uk=e.textContent);
let lang='uk';const hint=document.querySelector('#hint'),selection=document.querySelector('#selection');
const translations={'Завантаження моделі':'Loading model','Повторити розкриття':'Replay assembly','Перетягніть для обертання · наведіть для виділення':'Drag to rotate · hover to highlight','Проведіть для обертання · торкніться для виділення':'Drag to rotate · tap to highlight','Оптичне вікно':'Optical window','Передня горловина':'Front neck','Плече корпусу':'Housing shoulder','Контактна зона':'Contact interface','Основний корпус':'Main housing','Задній інтерфейс':'Rear interface','3D недоступне — показано статичний ракурс':'3D unavailable — showing a static view','Не вдалося завантажити 3D — показано статичний ракурс':'3D could not load — showing a static view'};
function translateDynamic(e){const current=e.textContent;const next=lang==='en'?translations[current]:Object.keys(translations).find(k=>translations[k]===current);if(next&&next!==current)e.textContent=next}
for(const e of [hint,selection])new MutationObserver(()=>translateDynamic(e)).observe(e,{childList:true});
document.querySelectorAll('[data-lang]').forEach(b=>b.onclick=()=>{lang=b.dataset.lang;document.documentElement.lang=lang;bilingual.forEach(e=>e.textContent=e.dataset[lang]);document.querySelectorAll('[data-lang]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.lang===lang)));document.querySelector('#replay').textContent=lang==='en'?'Replay assembly':'Повторити розкриття';menu.setAttribute('aria-label',lang==='en'?'Open menu':'Відкрити меню');document.querySelector('#close-menu').setAttribute('aria-label',lang==='en'?'Close menu':'Закрити меню');document.title=lang==='en'?'IFTORA — About':'IFTORA — Про компанію';translateDynamic(hint);translateDynamic(selection)});
const process=document.querySelector('#process');
process.querySelectorAll('li').forEach((item,i)=>item.style.setProperty('--step',i));
if(!matchMedia('(prefers-reduced-motion: reduce)').matches){process.classList.add('motion-ready');const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){process.classList.add('in-view');observer.disconnect()}},{threshold:.25});observer.observe(process)}

function homeLinks(){document.querySelectorAll('[data-home]').forEach(a=>a.href='../?lang='+document.documentElement.lang)}
if(new URLSearchParams(location.search).get('lang')==='en')document.querySelector('[data-lang="en"]').click();
homeLinks();
document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>{homeLinks();const u=new URL(location.href);u.searchParams.set('lang',b.dataset.lang);history.replaceState(null,'',u)}));
