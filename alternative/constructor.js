(() => {
  'use strict';
  const E=window.ShipBuilder, $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const panel=$('.build-panel'), grid=$('#ship-grid'), strip=$('.module-strip'), status=$('#build-status');
  let lang='ru', items=structuredClone(E.initial), selected='laser', rotated=false, selectedId=null, nextId=6;
  let gesture=null, preview=null, suppressClickUntil=0, lastStatus='', focusCell='1-3';
  const history=[];
  const t=(ru,en)=>lang==='ru'?ru:en;
  const name=type=>E.catalog[type][lang];
  const copy=()=>structuredClone(items);
  function save(){history.push(copy());if(history.length>40)history.shift();}
  function announce(text,tone='neutral') {status.dataset.tone=tone;if(text!==lastStatus){status.textContent=text;lastStatus=text;}}
  function instruction(){announce(t('Перетащи модуль из ленты на свободное место.','Drag a module from the strip to a free space.'));}
  const footprint=document.createElement('div');footprint.className='placement-preview';footprint.hidden=true;footprint.setAttribute('aria-hidden','true');
  const parts=document.createElement('div');parts.className='placed-modules';
  E.shape.forEach((row,r)=>[...row].forEach((active,c)=>{
    const cell=document.createElement(active==='1'?'button':'span');
    cell.className=active==='1'?'hull-cell':'hull-gap';cell.dataset.cell=`${r}-${c}`;
    cell.style.left=`${c*10}%`;cell.style.top=`${r*10}%`;
    if(active==='1'){cell.type='button';cell.tabIndex=cell.dataset.cell===focusCell?0:-1;}else cell.setAttribute('aria-hidden','true');
    grid.append(cell);
  }));
  grid.append(parts,footprint);
  Object.entries(E.catalog).forEach(([type,module])=>{
    const button=document.createElement('button');button.type='button';button.className='module-card';button.dataset.module=type;button.dataset.category=module.category;
    button.innerHTML=`<span class="module-dimensions">${module.w} × ${module.h}</span><span class="module-card-art"><img src="assets/${type}.webp" alt="" draggable="false"></span><span class="module-card-name"></span>`;
    strip.append(button);
  });
  function position(element,item){const {w,h}=E.size(item.type,item.rotated);Object.assign(element.style,{left:`${item.c*10}%`,top:`${item.r*10}%`,width:`${w*10}%`,height:`${h*10}%`});}
  function artwork(element,type,isRotated){
    const {w,h}=E.catalog[type];
    element.innerHTML=`<img src="assets/${type}.webp" alt="" draggable="false">`;
    const img=element.firstElementChild;
    if(isRotated&&w!==h){img.style.width=`${w/h*100}%`;img.style.height=`${h/w*100}%`;img.style.transform='translate(-50%,-50%) rotate(90deg)';}
  }
  function refreshLabels(){
    $$('.hull-cell').forEach(cell=>{const [r,c]=cell.dataset.cell.split('-').map(Number),occupant=E.at(items,r,c);cell.setAttribute('aria-label',t(`Ряд ${r+1}, колонка ${c+1}. ${occupant?name(occupant.type):'Свободно'}.`,`Row ${r+1}, column ${c+1}. ${occupant?name(occupant.type):'Free'}.`));cell.dataset.occupied=occupant?String(occupant.id):'';});
    $$('.module-card').forEach(button=>{const type=button.dataset.module,m=E.catalog[type];button.querySelector('.module-card-name').textContent=name(type);button.setAttribute('aria-label',`${name(type)}, ${m.w} × ${m.h}`);button.setAttribute('aria-pressed',String(type===selected&&selectedId===null));});
    $$('.placed-module').forEach(button=>{const item=items.find(p=>p.id===Number(button.dataset.id)),s=E.size(item.type,item.rotated);button.setAttribute('aria-label',t(`${name(item.type)}, ${s.w} × ${s.h}. Выбрать или перетащить.`,`${name(item.type)}, ${s.w} × ${s.h}. Select or drag.`));button.setAttribute('aria-pressed',String(item.id===selectedId));});
  }
  function inspect(){
    const module=E.catalog[selected],size=E.size(selected,rotated);
    $('#module-name').textContent=name(selected);$('#module-size').textContent=`${size.w} × ${size.h}`;
    $('#module-description').textContent=module.description[lang==='ru'?0:1];
    $('#module-preview').src=`assets/${selected}.webp`;$('#module-preview').style.transform=rotated?'rotate(90deg)':'';
    $('#rotate-module').disabled=module.w===module.h;
    $('#remove-module').disabled=selectedId===null;
    $('#undo-build').disabled=history.length===0;
    const used=items.reduce((sum,p)=>sum+E.cells(p).length,0),total=E.shape.join('').replaceAll('0','').length;
    $('#build-count').textContent=t(`${used} / ${total} КЛЕТОК`,`${used} / ${total} CELLS`);
    refreshLabels();
  }
  function render(){
    parts.replaceChildren();
    for(const item of items){
      const button=document.createElement('button');button.type='button';button.className='placed-module';button.dataset.id=item.id;button.dataset.type=item.type;button.dataset.category=E.catalog[item.type].category;
      position(button,item);artwork(button,item.type,item.rotated);parts.append(button);
    }
    inspect();
  }
  function choose(type,id=null){
    clearPreview();selected=type;selectedId=id;rotated=id===null?false:items.find(p=>p.id===id).rotated;inspect();
    announce(id===null?t(`${name(type)} выбран. Перетащи его или нажми на свободную клетку.`,`${name(type)} selected. Drag it or click a free square.`):t('Модуль выбран. Перемести, поверни или удали его.','Module selected. Move, rotate or remove it.'));
  }
  function clearPreview(){preview=null;footprint.hidden=true;grid.removeAttribute('data-placement');$$('.drop-valid,.drop-invalid').forEach(cell=>cell.classList.remove('drop-valid','drop-invalid'));}
  function reasonText(reason){return reason==='outside'?t('Не помещается: весь модуль должен быть внутри корпуса.','Does not fit: the entire module must stay inside the hull.'):t('Здесь уже есть модуль. Найди свободное место.','This space is occupied. Find a free area.');}
  function showPreview(r,c,type=selected,isRotated=rotated,id=selectedId){
    clearPreview();const item={type,rotated:isRotated,r,c},result=E.check(items,item,id);
    preview={item,id,result};grid.dataset.placement=result.valid?'valid':'invalid';
    footprint.hidden=false;footprint.dataset.valid=String(result.valid);position(footprint,item);artwork(footprint,type,isRotated);
    result.cells.forEach(({r,c})=>grid.querySelector(`[data-cell="${r}-${c}"]`)?.classList.add(result.valid?'drop-valid':'drop-invalid'));
    announce(result.valid?t('✓ Можно поставить. Отпусти модуль или нажми на клетку.','✓ Fits here. Drop the module or click the square.'):reasonText(result.reason),result.valid?'valid':'invalid');
    return result;
  }
  function commit(item,id=null){
    const result=E.check(items,item,id);
    if(!result.valid){announce(reasonText(result.reason),'invalid');return false;}
    const current=items.find(p=>p.id===id);
    if(current&&current.r===item.r&&current.c===item.c&&current.rotated===item.rotated){clearPreview();instruction();return true;}
    save();
    if(current)Object.assign(current,item);else items.push({...item,id:nextId++});
    clearPreview();render();announce(t(`✓ ${name(item.type)} ${current?'перемещён':'установлен'}.`, `✓ ${name(item.type)} ${current?'moved':'placed'}.`),'valid');
    return true;
  }
  function coords(x,y){const rect=grid.getBoundingClientRect();return {r:Math.floor((y-rect.top)/(rect.height/10)),c:Math.floor((x-rect.left)/(rect.width/10)),inside:x>=rect.left&&x<rect.right&&y>=rect.top&&y<rect.bottom};}
  const ghost=document.createElement('div');ghost.className='module-drag-ghost';ghost.hidden=true;ghost.setAttribute('aria-hidden','true');document.body.append(ghost);
  function updateDrag(){
    if(!gesture?.started)return;
    const p=coords(gesture.x,gesture.y),r=p.r-gesture.offsetR,c=p.c-gesture.offsetC;
    const near=p.r>=-3&&p.r<13&&p.c>=-3&&p.c<13;
    if(near)showPreview(r,c,gesture.type,gesture.rotated,gesture.id);else{clearPreview();announce(t('Перенеси модуль на корпус.','Move the module onto the hull.'));}
    const rect=grid.getBoundingClientRect(),s=E.size(gesture.type,gesture.rotated),unit=rect.width/10;
    Object.assign(ghost.style,{width:`${s.w*unit}px`,height:`${s.h*unit}px`,left:`${gesture.x-(gesture.offsetC+.5)*unit}px`,top:`${gesture.y-(gesture.offsetR+.5)*unit}px`});
    ghost.dataset.valid=near?String(preview.result.valid):'unknown';
  }
  panel.addEventListener('pointerdown',event=>{
    if(event.button!==0||gesture)return;
    const card=event.target.closest('.module-card'),placed=event.target.closest('.placed-module');
    if(!card&&!placed)return;
    const id=placed?Number(placed.dataset.id):null,type=card?card.dataset.module:items.find(p=>p.id===id).type;
    const keepRotation=card&&selected===type&&selectedId===null?rotated:null;
    choose(type,id);if(keepRotation!==null){rotated=keepRotation;inspect();}
    const item=items.find(p=>p.id===id),p=coords(event.clientX,event.clientY);
    gesture={pointerId:event.pointerId,type,id,rotated,startX:event.clientX,startY:event.clientY,x:event.clientX,y:event.clientY,offsetR:item?p.r-item.r:0,offsetC:item?p.c-item.c:0,started:false};
    panel.setPointerCapture(event.pointerId);
  });
  panel.addEventListener('pointermove',event=>{
    if(!gesture||gesture.pointerId!==event.pointerId)return;
    gesture.x=event.clientX;gesture.y=event.clientY;
    if(!gesture.started&&Math.hypot(event.clientX-gesture.startX,event.clientY-gesture.startY)>6){
      gesture.started=true;document.body.classList.add('module-dragging');ghost.hidden=false;artwork(ghost,gesture.type,gesture.rotated);
      if(!scrollFrame)scrollFrame=requestAnimationFrame(autoScroll);
      if(gesture.id!==null)parts.querySelector(`[data-id="${gesture.id}"]`)?.classList.add('drag-source');
    }
    if(gesture.started){event.preventDefault();updateDrag();}
  });
  function finishGesture(cancelled=false){
    if(!gesture)return;
    const g=gesture;
    if(g.started&&!cancelled){
      const p=coords(g.x,g.y);
      if(p.inside)commit({type:g.type,rotated:g.rotated,r:p.r-g.offsetR,c:p.c-g.offsetC},g.id);
      else announce(t('Размещение отменено. Модуль остался на своём месте.','Placement cancelled. The original layout is unchanged.'));
    }
    suppressClickUntil=g.started?performance.now()+120:0;gesture=null;ghost.hidden=true;cancelAnimationFrame(scrollFrame);scrollFrame=0;document.body.classList.remove('module-dragging');$$('.drag-source').forEach(e=>e.classList.remove('drag-source'));clearPreview();
    if(panel.hasPointerCapture(g.pointerId))panel.releasePointerCapture(g.pointerId);
    if(cancelled)announce(t('Перетаскивание отменено.','Drag cancelled.'));
  }
  panel.addEventListener('pointerup',event=>{if(gesture?.pointerId===event.pointerId){gesture.x=event.clientX;gesture.y=event.clientY;finishGesture();}});
  panel.addEventListener('pointercancel',()=>finishGesture(true));
  panel.addEventListener('lostpointercapture',()=>{if(gesture)finishGesture(true);});
  window.addEventListener('blur',()=>finishGesture(true));
  window.addEventListener('resize',()=>{finishGesture(true);clearPreview();});
  // Scroll on touch remains available around the rack; on desktop, let long drags reach the board.
  let scrollFrame=0;
  function autoScroll(){
    scrollFrame=0;
    if(!gesture?.started)return;
    const y=gesture.y,edge=65;let delta=y<edge?-Math.ceil((edge-y)/7):y>innerHeight-edge?Math.ceil((y-innerHeight+edge)/7):0;if(delta){window.scrollBy(0,delta);updateDrag();}
    scrollFrame=requestAnimationFrame(autoScroll);
  }
  window.addEventListener('pagehide',()=>cancelAnimationFrame(scrollFrame),{once:true});
  strip.addEventListener('click',event=>{const card=event.target.closest('.module-card');if(card&&event.detail===0)choose(card.dataset.module);});
  grid.addEventListener('pointermove',event=>{
    if(gesture||event.pointerType==='touch')return;
    const p=coords(event.clientX,event.clientY);
    if(p.inside)showPreview(p.r,p.c);else clearPreview();
  });
  grid.addEventListener('pointerleave',()=>{if(!gesture){clearPreview();instruction();}});
  grid.addEventListener('click',event=>{
    if(performance.now()<suppressClickUntil&&event.detail!==0)return;
    const placed=event.target.closest('.placed-module');
    if(placed){choose(placed.dataset.type,Number(placed.dataset.id));return;}
    const cell=event.target.closest('.hull-cell');if(!cell)return;
    const [r,c]=cell.dataset.cell.split('-').map(Number),occupant=E.at(items,r,c);
    if(occupant&&occupant.id!==selectedId){choose(occupant.type,occupant.id);return;}
    commit({type:selected,rotated,r,c},selectedId);
  });
  grid.addEventListener('focusin',event=>{const cell=event.target.closest('.hull-cell');if(cell){focusCell=cell.dataset.cell;$$('.hull-cell').forEach(e=>e.tabIndex=e===cell?0:-1);const [r,c]=focusCell.split('-').map(Number);showPreview(r,c);}});
  grid.addEventListener('focusout',event=>{if(!grid.contains(event.relatedTarget)&&!gesture)clearPreview();});
  grid.addEventListener('keydown',event=>{
    const cell=event.target.closest('.hull-cell');if(!cell||!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.key))return;
    event.preventDefault();const [r,c]=cell.dataset.cell.split('-').map(Number),vertical=['ArrowUp','ArrowDown'].includes(event.key),sign=['ArrowUp','ArrowLeft'].includes(event.key)?-1:1;
    for(let n=1;n<10;n++){const next=grid.querySelector(`.hull-cell[data-cell="${r+(vertical?n*sign:0)}-${c+(vertical?0:n*sign)}"]`);if(next){next.focus();break;}}
  });
  function rotate(){
    if($('#rotate-module').disabled)return;
    if(gesture?.started){gesture.rotated=!gesture.rotated;rotated=gesture.rotated;const s=E.size(gesture.type,gesture.rotated);gesture.offsetR=Math.min(gesture.offsetR,s.h-1);gesture.offsetC=Math.min(gesture.offsetC,s.w-1);artwork(ghost,gesture.type,gesture.rotated);inspect();updateDrag();return;}
    if(selectedId!==null){const item=items.find(p=>p.id===selectedId);if(!commit({...item,rotated:!item.rotated},selectedId))return;rotated=items.find(p=>p.id===selectedId).rotated;}else rotated=!rotated;
    inspect();if(preview)showPreview(preview.item.r,preview.item.c);announce(t('Модуль повёрнут.','Module rotated.'));
  }
  function remove(){if(selectedId===null)return;save();items=items.filter(p=>p.id!==selectedId);selectedId=null;clearPreview();render();announce(t('Модуль удалён. Действие можно отменить.','Module removed. You can undo this action.'));}
  $('#rotate-module').addEventListener('click',rotate);$('#remove-module').addEventListener('click',remove);
  $('#undo-build').addEventListener('click',()=>{if(!history.length)return;items=history.pop();selectedId=null;clearPreview();render();announce(t('Последнее изменение отменено.','Last change undone.'));});
  $('.reset-build').addEventListener('click',()=>{save();items=structuredClone(E.initial);selectedId=null;rotated=false;selected='laser';clearPreview();render();announce(t('Начальная сборка восстановлена. Это действие тоже можно отменить.','Starter layout restored. You can undo this action too.'));});
  panel.addEventListener('keydown',event=>{
    if(event.key==='Escape'){event.preventDefault();finishGesture(true);selectedId=null;clearPreview();inspect();instruction();return;}
    if(event.ctrlKey||event.metaKey||event.altKey)return;
    if(event.key.toLowerCase()==='r'||event.key.toLowerCase()==='к'){event.preventDefault();rotate();}
    if(event.key==='Delete'||event.key==='Backspace'){event.preventDefault();remove();}
  });
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&gesture)finishGesture(true);});
  function rackState(){const max=strip.scrollWidth-strip.clientWidth;$('.rack-prev').disabled=strip.scrollLeft<=1;$('.rack-next').disabled=strip.scrollLeft>=max-1;}
  $('.rack-prev').addEventListener('click',()=>strip.scrollBy({left:-240,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'}));
  $('.rack-next').addEventListener('click',()=>strip.scrollBy({left:240,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'}));
  strip.addEventListener('scroll',rackState,{passive:true});new ResizeObserver(rackState).observe(strip);
  window.addEventListener('sa:language',event=>{
    finishGesture(true);lang=event.detail;render();instruction();
    grid.setAttribute('aria-label',t('Поле сборки корабля','Ship construction grid'));strip.setAttribute('aria-label',t('Лента модулей','Module strip'));
    $('.rack-prev').setAttribute('aria-label',t('Модули левее','Scroll modules left'));$('.rack-next').setAttribute('aria-label',t('Модули правее','Scroll modules right'));
  });
  render();instruction();rackState();
})();
