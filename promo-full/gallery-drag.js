// A single bounded gesture settles to this frame or one adjacent frame.
window.setupGalleryDrag=({root,carousel,signal})=>{
 const stage=root.querySelector('.gallery-stage'),frame=root.querySelector('.gallery-open');
 let gesture=null,settling=false,suppressClick=false,timer=null,finishTransition=null,disposed=false;
 const listen=(el,type,fn,options={})=>el.addEventListener(type,fn,{...options,signal});
 const offset=(x,animate=false)=>{stage.classList.toggle('is-snapping',animate);stage.style.setProperty('--drag-x',x+'px');const ratio=Math.min(1,Math.abs(x)/frame.offsetWidth);stage.style.setProperty('--peek-scale',.92+.08*ratio);stage.style.setProperty('--peek-bright',.45+.55*ratio);};
 stage.querySelectorAll('img').forEach(img=>img.draggable=false);listen(stage,'dragstart',e=>e.preventDefault());
 function settleAnimation(x){return new Promise(resolve=>{let done=false;const finish=()=>{if(done)return;done=true;clearTimeout(timer);timer=null;frame.removeEventListener('transitionend',ended);finishTransition=null;resolve();};const ended=e=>{if(e.target===frame&&e.propertyName==='transform')finish();};finishTransition=finish;frame.addEventListener('transitionend',ended);offset(x,true);if(carousel.motion.matches){finish();return;}timer=setTimeout(finish,400);});}
 async function settle(direction,point){
  settling=true;stage.classList.remove('is-dragging');
  const target=(carousel.index+direction+carousel.count)%carousel.count;
  try{if(direction)await carousel.prepare(target);if(disposed)return;await settleAnimation(direction?-direction*frame.offsetWidth:0);if(disposed)return;
   if(direction){stage.classList.add('snap-commit');await carousel.go(target);if(disposed)return;offset(0);void frame.offsetWidth;stage.classList.remove('snap-commit');}
   else offset(0);
  }finally{if(!disposed){stage.classList.remove('is-snapping');settling=false;carousel.pause('gesture',false);if(point?.type==='mouse'){const node=document.elementFromPoint(point.x,point.y);carousel.pause('hover',!!(node?.closest('[data-carousel-hover]')&&root.contains(node)));}}}
 }
 listen(stage,'pointerdown',e=>{
  if(settling||gesture||!e.isPrimary||e.pointerType==='mouse'&&e.button!==0)return;
  suppressClick=false;gesture={id:e.pointerId,x:e.clientX,y:e.clientY,lastX:e.clientX,lastT:performance.now(),velocity:0,dx:0,horizontal:false,type:e.pointerType};
  carousel.pause('gesture',true);stage.classList.add('is-dragging');
  // Delay touch capture until horizontal intent; the browser owns vertical pan.
  if(e.pointerType==='mouse')e.preventDefault();
 });
 listen(stage,'pointermove',e=>{
  if(!gesture||e.pointerId!==gesture.id)return;
  const dx=e.clientX-gesture.x,dy=e.clientY-gesture.y;
  if(!gesture.horizontal){if(Math.abs(dy)>10&&Math.abs(dy)>Math.abs(dx)*1.2){cancel();return;}if(Math.abs(dx)<6||Math.abs(dx)<Math.abs(dy)*1.2)return;gesture.horizontal=true;try{stage.setPointerCapture(e.pointerId);}catch{}}
  const now=performance.now(),dt=now-gesture.lastT;if(dt>0)gesture.velocity=(e.clientX-gesture.lastX)/dt;gesture.lastX=e.clientX;gesture.lastT=now;gesture.dx=Math.max(-frame.offsetWidth,Math.min(frame.offsetWidth,dx));suppressClick=true;offset(gesture.dx);if(e.cancelable)e.preventDefault();
 });
 listen(stage,'pointerup',e=>{
  if(!gesture||e.pointerId!==gesture.id)return;const g=gesture;gesture=null;
  const recent=performance.now()-g.lastT<100,velocity=recent?g.velocity:0;
  const distance=Math.abs(g.dx)>Math.max(45,frame.offsetWidth*.18),flick=Math.abs(g.dx)>12&&Math.abs(velocity)>.5&&Math.sign(velocity)===Math.sign(g.dx);
  const direction=g.horizontal&&(distance||flick)?(g.dx<0?1:-1):0;
  try{if(stage.hasPointerCapture(e.pointerId))stage.releasePointerCapture(e.pointerId);}catch{}
  if(!g.horizontal){stage.classList.remove('is-dragging');carousel.pause('gesture',false);return;}
  settle(direction,{x:e.clientX,y:e.clientY,type:g.type}).catch(()=>{offset(0);});
 });
 function cancel(){if(!gesture)return;const g=gesture;gesture=null;suppressClick=g.horizontal;try{if(stage.hasPointerCapture(g.id))stage.releasePointerCapture(g.id);}catch{}settle(0).catch(()=>offset(0));}
 listen(stage,'pointercancel',cancel);listen(stage,'lostpointercapture',e=>{if(e.target===stage)cancel();});
 listen(stage,'click',e=>{if(suppressClick||settling){e.preventDefault();e.stopImmediatePropagation();suppressClick=false;}},{capture:true});
 listen(window,'pointerup',cancel);listen(window,'blur',cancel);listen(document,'visibilitychange',()=>{if(document.hidden)cancel();});listen(window,'resize',cancel);
 listen(root,'keydown',e=>{if(settling&&['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();e.stopImmediatePropagation();}},{capture:true});
 listen(root,'click',e=>{if(settling&&e.target.closest('[data-carousel-go],[data-gallery-prev],[data-gallery-next]')){e.preventDefault();e.stopImmediatePropagation();}},{capture:true});
 signal.addEventListener('abort',()=>{disposed=true;gesture=null;clearTimeout(timer);finishTransition?.();stage.classList.remove('is-dragging','is-snapping','snap-commit');offset(0);},{once:true});
};
