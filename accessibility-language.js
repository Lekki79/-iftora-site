// Accessible names follow the page language, including asynchronously added canvases.
(()=>{
 const about=!!document.querySelector('#stage');
 const set=(selector,attribute,uk,en)=>document.querySelectorAll(selector).forEach(e=>e.setAttribute(attribute,document.documentElement.lang==='en'?en:uk));
 function sync(){
  const open=about?document.querySelector('#menu-dialog')?.open:document.querySelector('#menu')?.getAttribute('aria-expanded')==='true';
  set('#menu','aria-label',open?'Закрити меню':'Відкрити меню',open?'Close menu':'Open menu');
  set('#menu-close,#close-menu','aria-label','Закрити меню','Close menu');
  set('.language,.footer-language','aria-label','Мова','Language');
  set('[data-lang="uk"]','aria-label','Українська','Ukrainian');
  set('[data-lang="en"]','aria-label','Англійська','English');
  set('#menu-panel,#menu-dialog','aria-label','Меню','Menu');
  set('nav','aria-label','Навігація','Navigation');
  set('.direction-callouts','aria-label','Інженерні напрями','Engineering disciplines');
  set('#model','aria-label','Реальна модель ІЧ-модуля. Перетягніть або скористайтеся клавішами зі стрілками для зміни ракурсу','Infrared module model. Drag or use the arrow keys to change the view');
  set('.model-section','aria-label','3D-модель модуля','3D module model');
  set('#stage canvas','aria-label','3D-модель: перетягніть горизонтально або скористайтеся клавішами зі стрілками','3D model: drag horizontally or use the arrow keys');
  set('#model img','alt','Реальна модель ІЧ-модуля','Infrared module model');
  set('#poster','alt','Модель модуля','Module model');
  const skip=document.querySelector('.skip');if(skip)skip.textContent=document.documentElement.lang==='en'?'Skip to content':'До змісту';
 }
 new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
 const menu=document.querySelector('#menu');if(menu)new MutationObserver(sync).observe(menu,{attributes:true,attributeFilter:['aria-expanded']});
 const dialog=document.querySelector('#menu-dialog');if(dialog)new MutationObserver(sync).observe(dialog,{attributes:true,attributeFilter:['open']});
 const stage=document.querySelector('#stage');if(stage)new MutationObserver(sync).observe(stage,{childList:true});
 document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',sync));
 sync();
})();
