/* Presentation battle B: authored choreography, not Space Arena simulation. */
(() => {
  'use strict';
  const $ = s => document.querySelector(s), E = window.ShipBuilder;
  const dialog = $('.battle-dialog'), canvas = $('#battle-canvas'), ctx = canvas.getContext('2d');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const UNIT = 17, END = 13.8, STEP = 1 / 60;
  const weapons = ['cannon', 'laser', 'weapon'], images = {};
  const opponent = [
    {type:'weapon',r:0,c:4}, {type:'laser',r:2,c:2}, {type:'laser',r:2,c:7},
    {type:'power-core',r:4,c:3}, {type:'shield',r:5,c:6}, {type:'thruster',r:7,c:1}
  ];
  let items = [], ships = [], shots = [], sparks = [], marks = [], frame = 0;
  let time = 0, last = 0, accumulator = 0, done = false, winning = true, death = null;
  let width = 1, height = 1, dpr = 1, camera = {x:600,y:340}, hudTime = 0;
  let stats = {}, seed = 31;
  const t = (ru,en) => document.documentElement.lang === 'en' ? en : ru;
  const clamp = (x,a,b) => Math.max(a,Math.min(b,x));
  const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const angleDelta = a => Math.atan2(Math.sin(a),Math.cos(a));
  const point = (ship,p) => ({x:ship.x+p.x*Math.cos(ship.a)-p.y*Math.sin(ship.a),y:ship.y+p.x*Math.sin(ship.a)+p.y*Math.cos(ship.a)});
  function local(item, rear = false) {
    const size = E.size(item.type,item.rotated);
    return {x:(item.c+size.w/2-5)*UNIT,y:(item.r+(rear?size.h:size.h/2)-5)*UNIT};
  }
  function sprite(parts, enemy) {
    const c = document.createElement('canvas'); c.width = c.height = 384;
    const g = c.getContext('2d'); g.scale(2,2); g.translate(96,96);
    E.shape.forEach((row,r) => [...row].forEach((cell,col) => {
      if(cell !== '1') return;
      const x=(col-5)*UNIT, y=(r-5)*UNIT;
      const gradient=g.createLinearGradient(x,y,x+UNIT,y+UNIT);
      gradient.addColorStop(0,enemy?'#586173':'#637f94');gradient.addColorStop(1,'#152633');
      g.fillStyle=gradient;g.fillRect(x+.6,y+.6,UNIT-1.2,UNIT-1.2);
      g.strokeStyle=enemy?'#8790a044':'#abcdd044';g.strokeRect(x+1,y+1,UNIT-2,UNIT-2);
    }));
    parts.forEach(item => {
      const size=E.size(item.type,item.rotated), x=(item.c-5)*UNIT,y=(item.r-5)*UNIT;
      g.save();g.translate(x+size.w*UNIT/2,y+size.h*UNIT/2);
      if(item.rotated)g.rotate(Math.PI/2);
      const original=E.catalog[item.type], img=images[item.type];
      if(img?.complete&&img.naturalWidth)g.drawImage(img,-original.w*UNIT/2,-original.h*UNIT/2,original.w*UNIT,original.h*UNIT);
      else {g.fillStyle='#9bb0b9';g.fillRect(-size.w*UNIT/2,-size.h*UNIT/2,size.w*UNIT,size.h*UNIT);}
      g.restore();
    });
    return c;
  }
  let loaded = false;
  function loadImages() {
    if(loaded)return;loaded=true;
    Object.keys(E.catalog).forEach(type => {
      const img = images[type] = new Image();
      img.onload = () => {ships.forEach(s=>s.sprite=sprite(s.parts,s.enemy));if(dialog.open)draw();};
      img.src=`assets/${type}.webp`;
    });
  }
  // Continuous authored paths: no combat AI or layout-dependent flight physics.
  const paths = [
    [[285,365],[350,350],[440,285],[465,235],[420,255],[365,325],[395,365],[425,350]],
    [[915,290],[845,310],[775,365],[755,410],[805,410],[850,355],[800,295],[775,310]]
  ];
  function position(index, elapsed) {
    const path=paths[index], u=clamp(elapsed/END,0,1)*(path.length-1), n=Math.min(path.length-2,Math.floor(u)), f=u-n;
    const a=path[Math.max(0,n-1)],b=path[n],c=path[n+1],d=path[Math.min(path.length-1,n+2)];
    return [0,1].map(k=>.5*((2*b[k])+(-a[k]+c[k])*f+(2*a[k]-5*b[k]+4*c[k]-d[k])*f*f+(-a[k]+3*b[k]-3*c[k]+d[k])*f*f*f));
  }
  function burst(p,count,color,speed=70) {
    for(let i=0;i<count&&sparks.length<180;i++) {
      const a=random()*Math.PI*2,v=(.25+random())*speed;
      sparks.push({x:p.x,y:p.y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:.3+random()*.65,age:0,color,size:1+random()*2});
    }
  }
  function fire(source,target,weapon,finisher=false) {
    if(death)return;
    const origin=point(source,local(weapon)), hit={x:(random()-.5)*95,y:(random()-.5)*90};
    shots.push({source:source.index,target:target.index,origin,muzzle:local(weapon),hit,type:weapon.type,start:time,
      duration:weapon.type==='laser'?.13:weapon.type==='weapon'?.28:.38,impacted:false,finisher});
    burst(origin,3,source.enemy?'#ffc887':'#9bfcff',30);stats.fired++;
  }
  function impact(shot) {
    const target=ships[shot.target], p=point(target,shot.hit);
    if(target.hp<=0){shot.impacted=true;return;}
    shot.impacted=true;stats.hits++;
    const shield=target.parts.some(p=>p.type==='shield')&&time<5.6;
    marks.push({ship:target.index,local:shot.hit,start:time,shield});
    burst(p,shield?7:12,shield?'#8aefff':'#ffb469');
    target.hp=shot.finisher?0:Math.max(target.index===(winning?1:0)?12:42,target.hp-(target.enemy?4.4:3));
    if(shot.finisher) {
      death={ship:target.index,start:time,x:target.x,y:target.y};
      burst(target,68,'#ffd194',135);stats.destroyed++;
    }
  }
  function labels() {
    $('#battle-demo-label').textContent=t('ИНТЕРАКТИВНАЯ ДЕМОНСТРАЦИЯ','INTERACTIVE DEMONSTRATION');
    $('#battle-demo-title').textContent=t('ИЗ АНГАРА — НА АРЕНУ.','FROM HANGAR TO ARENA.');
    $('#battle-demo-note').textContent=t('Сценарный бой · 14 секунд. Не реальные правила, ИИ или баланс Space Arena.','Scripted battle · 14 seconds. Not the actual Space Arena rules, AI or balance.');
    $('#player-label').textContent=t('ТВОЯ СБОРКА','YOUR BUILD');
    $('#enemy-label').textContent=t('ДЕМО-ПРОТИВНИК','DEMO OPPONENT');
    $('#back-to-build').textContent=t('ВЕРНУТЬСЯ К СБОРКЕ','BACK TO BUILD');
    $('#battle-finish').textContent=t('Перейти к результату','Skip to result');
    $('#battle-replay').textContent=t('Повторить бой ↻','Replay battle ↻');
    canvas.setAttribute('aria-label',t('Сценарная космическая схватка с текущей сборкой корабля','Scripted space battle featuring your current ship build'));
    $('#player-health').setAttribute('aria-label',t('Условная целостность твоей сборки','Illustrative integrity of your build'));
    $('#enemy-health').setAttribute('aria-label',t('Условная целостность противника','Illustrative opponent integrity'));
    report();
  }
  function report() {
    $('#battle-result-title').textContent=done?t(winning?'ЦЕЛЬ УНИЧТОЖЕНА.':'СБОРКА ПОТЕРЯНА.',winning?'TARGET DESTROYED.':'BUILD LOST.'):t('АВТОМАТИЧЕСКИЙ БОЙ','AUTOMATIC BATTLE');
    $('#battle-result-copy').textContent=done?
      t(winning?'Демонстрация завершена. Можно повторить сцену или вернуться к той же сборке. Исход задан сценарием.':'Без оружия эта демонстрационная сборка не открывает огонь. Вернись в ангар или повтори сцену. Исход задан сценарием.',
        winning?'Demonstration complete. Replay the scene or return to the same build. The outcome is scripted.':'Without weapons this demonstration build does not fire. Return to the hangar or replay. The outcome is scripted.'):
      t('Сближение, манёвр и обмен огнём. Модули на твоём корабле — из текущей сборки.','Closing in, manoeuvring and exchanging fire. Your ship carries the modules from your current build.');
    $('#battle-finish').hidden=done;$('#battle-replay').hidden=!done;
  }
  function hud() {$('#player-health').value=ships[0].hp;$('#enemy-health').value=ships[1].hp;}
  function viewScale() {
    if(ships.length<2)return 1;
    const dx=Math.abs(ships[0].x-ships[1].x)+300,dy=Math.abs(ships[0].y-ships[1].y)+300;
    return width/height<1.25?Math.min(width/dy,height/dx,1.2):Math.min(width/dx,height/dy,1.2);
  }
  function update(dt) {
    time=Math.min(END,time+dt);
    ships.forEach((s,i)=> {
      if(death?.ship===i)return;
      const [x,y]=position(i,time);s.x=x;s.y=y;
    });
    ships.forEach((s,i)=> {
      if(death?.ship===i)return;
      const other=ships[1-i], desired=Math.atan2(other.y-s.y,other.x-s.x)+Math.PI/2;
      s.a+=clamp(angleDelta(desired-s.a),-.8*dt,.8*dt);
      if(time>1.1&&time<10.6&&time>=s.next&&!death) {
        const armament=s.parts.filter(p=>weapons.includes(p.type));
        if(armament.length){fire(s,other,armament[s.volley%armament.length]);s.volley++;}
        s.next=time+(s.enemy?.68:.53);
      }
    });
    if(time>=11.05&&!stats.finalFired) {
      const source=ships[winning?0:1],target=ships[winning?1:0];
      fire(source,target,source.parts.find(p=>weapons.includes(p.type)),true);stats.finalFired=true;
    }
    shots.forEach(s=>{if(!s.impacted&&time-s.start>=s.duration)impact(s);});
    shots=shots.filter(s=>time-s.start<s.duration+.18);
    sparks.forEach(p=>{p.age+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.985;p.vy*=.985;});
    sparks=sparks.filter(p=>p.age<p.life);
    marks=marks.filter(m=>time-m.start<(m.shield?.45:4));
    const cx=(ships[0].x+ships[1].x)/2,cy=(ships[0].y+ships[1].y)/2;
    camera.x+=(cx-camera.x)*Math.min(1,dt*2);camera.y+=(cy-camera.y)*Math.min(1,dt*2);
    camera.zoom+=(viewScale()-camera.zoom)*Math.min(1,dt*1.5);
    if(time-hudTime>.1){hud();hudTime=time;}
    if(time>=END){done=true;hud();report();}
    canvas.dataset.time=time.toFixed(2);canvas.dataset.hits=stats.hits;canvas.dataset.destroyed=stats.destroyed;
  }
  function drawShip(s) {
    const destroyed=death?.ship===s.index, age=destroyed?time-death.start:0;
    if(destroyed&&age>1.1)return;
    ctx.save();ctx.translate(s.x,s.y);ctx.rotate(s.a);
    if(destroyed)ctx.globalAlpha=Math.max(0,1-age/1.1);
    if(!destroyed) s.parts.filter(p=>p.type==='thruster').forEach(item=> {
      const p=local(item,true),length=20+5*Math.sin(time*43+item.c);
      ctx.save();ctx.translate(p.x,p.y);if(item.rotated)ctx.rotate(Math.PI/2);
      const g=ctx.createLinearGradient(0,0,0,length);g.addColorStop(0,'#d9ffff');g.addColorStop(.2,'#57dfff');g.addColorStop(1,'#2985ff00');
      ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(-9,0);ctx.quadraticCurveTo(-6,length*.7,0,length);ctx.quadraticCurveTo(6,length*.7,9,0);ctx.fill();ctx.restore();
    });
    ctx.drawImage(s.sprite,-96,-96,192,192);
    marks.filter(m=>m.ship===s.index).forEach(m=> {
      const age=time-m.start;
      if(m.shield) {
        ctx.strokeStyle=`rgba(116,231,255,${Math.max(0,1-age/.45)})`;ctx.lineWidth=3;
        ctx.beginPath();ctx.ellipse(0,-12,99,96,0,-Math.PI*.85,-Math.PI*.15);ctx.stroke();
        // Short hex facets on the forward arc, visible only on shield impact.
        ctx.lineWidth=1;for(let j=-2;j<=2;j++){ctx.beginPath();for(let k=0;k<=6;k++){const a=k*Math.PI/3;ctx.lineTo(j*19+Math.cos(a)*10,-85+Math.abs(j)*6+Math.sin(a)*10);}ctx.stroke();}
      } else {
        ctx.fillStyle='#05090bbb';ctx.beginPath();ctx.ellipse(m.local.x,m.local.y,10,6,.3,0,Math.PI*2);ctx.fill();
        if(age<.2){ctx.fillStyle=`rgba(255,218,155,${1-age/.2})`;ctx.beginPath();ctx.arc(m.local.x,m.local.y,14*(1-age/.25),0,Math.PI*2);ctx.fill();}
        else if(age<2.5){const r=5+age*4;const smoke=ctx.createRadialGradient(m.local.x,m.local.y+age*9,0,m.local.x,m.local.y+age*9,r);smoke.addColorStop(0,'#151b22aa');smoke.addColorStop(1,'#151b2200');ctx.fillStyle=smoke;ctx.fillRect(m.local.x-r,m.local.y+age*9-r,r*2,r*2);}
      }
    });ctx.restore();
  }
  function draw() {
    if(!ships.length)return;
    const drawStart=performance.now();
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='#030912';ctx.fillRect(0,0,width,height);
    const nebula=ctx.createRadialGradient(width*.6,height*.4,0,width*.6,height*.4,width*.7);
    nebula.addColorStop(0,'#14283b');nebula.addColorStop(1,'#030912');ctx.fillStyle=nebula;ctx.fillRect(0,0,width,height);
    for(let i=0;i<115;i++) {
      const x=((i*173.13)%997)/997*width,y=((i*i*13.71)%991)/991*height;
      ctx.fillStyle=i%7===0?'#adcfdf88':'#65839955';ctx.fillRect(x,y,i%9===0?1.6:1,1);
    }
    const portrait=width/height<1.25;
    const scale=camera.zoom||viewScale();
    ctx.save();ctx.translate(width/2,height/2);ctx.scale(scale,scale);
    if(portrait)ctx.rotate(-Math.PI/2);ctx.translate(-camera.x,-camera.y);
    ships.forEach(drawShip);
    shots.forEach(s=> {
      const target=ships[s.target],end=point(target,s.hit),f=clamp((time-s.start)/s.duration,0,1);
      const origin=s.type==='laser'?point(ships[s.source],s.muzzle):s.origin;
      if(s.type==='laser') {
        ctx.globalAlpha=Math.max(0,1-(time-s.start)/(s.duration+.18));ctx.strokeStyle='#c09bff';ctx.lineWidth=3;
        ctx.beginPath();ctx.moveTo(origin.x,origin.y);ctx.lineTo(end.x,end.y);ctx.stroke();ctx.globalAlpha=1;
      } else if(!s.impacted) {
        const back=Math.max(0,f-.07),x=origin.x+(end.x-origin.x)*f,y=origin.y+(end.y-origin.y)*f;
        ctx.strokeStyle=s.type==='weapon'?'#c9fbff':'#ffd596';ctx.lineWidth=s.type==='weapon'?3:2;
        ctx.beginPath();ctx.moveTo(origin.x+(end.x-origin.x)*back,origin.y+(end.y-origin.y)*back);ctx.lineTo(x,y);ctx.stroke();
      }
    });
    sparks.forEach(p=>{ctx.globalAlpha=Math.max(0,1-p.age/p.life);ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,p.size*2,p.size);});ctx.globalAlpha=1;
    if(death) {
      const age=time-death.start;
      if(age<1.5) {
        const r=25+age*105,g=ctx.createRadialGradient(death.x,death.y,0,death.x,death.y,r);
        g.addColorStop(0,`rgba(255,241,207,${Math.max(0,1-age)})`);g.addColorStop(.3,`rgba(255,149,62,${Math.max(0,.7-age*.5)})`);g.addColorStop(1,'#ad341000');
        ctx.fillStyle=g;ctx.fillRect(death.x-r,death.y-r,r*2,r*2);
      }
      for(let i=0;i<12;i++) {
        const a=i*2.4,dist=age*(25+i*4);ctx.save();ctx.translate(death.x+Math.cos(a)*dist,death.y+Math.sin(a)*dist);ctx.rotate(a+age*.5);
        ctx.globalAlpha=Math.max(.15,1-age/3);
        const wreck=ships[death.ship].sprite,sx=48+(i%4)*64,sy=48+Math.floor(i/4)*64;
        ctx.drawImage(wreck,sx,sy,48,48,-9,-9,18,18);ctx.restore();
      }
    }
    ctx.restore();stats.frames++;const cost=performance.now()-drawStart;
    stats.drawMs+=cost;stats.maxDrawMs=Math.max(stats.maxDrawMs,cost);
  }
  function resize() {
    const box=canvas.getBoundingClientRect();width=Math.max(1,box.width);height=Math.max(1,box.height);dpr=Math.min(devicePixelRatio||1,width<600?1.5:2);
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);camera.zoom=viewScale();if(dialog.open)draw();
  }
  function animate(now) {
    frame=0;if(!dialog.open||done||document.hidden)return;
    accumulator+=Math.min(.1,last?(now-last)/1000:0);last=now;
    while(accumulator>=STEP&&!done){update(STEP);accumulator-=STEP;}
    draw();if(!done)frame=requestAnimationFrame(animate);
  }
  function finish() {
    cancelAnimationFrame(frame);frame=0;
    // Accessible skip/reduced-motion path uses the same events, without rendering motion.
    while(!done)update(STEP);shots=[];sparks=[];draw();
  }
  function start() {
    cancelAnimationFrame(frame);seed=31;time=0;last=0;accumulator=0;hudTime=0;done=false;death=null;
    shots=[];sparks=[];marks=[];stats={fired:0,hits:0,destroyed:0,frames:0,drawMs:0,maxDrawMs:0,finalFired:false};
    winning=items.some(p=>weapons.includes(p.type));camera={x:600,y:340};
    ships=[items,opponent].map((parts,i)=>({parts,index:i,enemy:!!i,x:paths[i][0][0],y:paths[i][0][1],a:i?-Math.PI/2:Math.PI/2,hp:100,next:1.15+i*.2,volley:0,sprite:sprite(parts,!!i)}));
    labels();hud();resize();loadImages();
    if(reduced.matches)finish();else frame=requestAnimationFrame(animate);
  }
  $('#launch-build').addEventListener('click',()=>{items=window.HangarBuild.snapshot();dialog.showModal();start();});
  $('#battle-replay').addEventListener('click',start);
  $('#battle-finish').addEventListener('click',finish);
  function close(){cancelAnimationFrame(frame);frame=0;dialog.close();}
  [$('#back-to-build'),$('.close-battle')].forEach(b=>b.addEventListener('click',close));
  dialog.addEventListener('cancel',()=>{cancelAnimationFrame(frame);frame=0;});
  dialog.addEventListener('close',()=>{cancelAnimationFrame(frame);frame=0;$('#launch-build').focus({preventScroll:true});});
  dialog.addEventListener('click',e=>{const r=dialog.getBoundingClientRect();if(e.target===dialog&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))dialog.close();});
  document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(frame);frame=0;last=0;if(!document.hidden&&dialog.open&&!done)frame=requestAnimationFrame(animate);});
  reduced.addEventListener('change',()=>{if(dialog.open&&reduced.matches&&!done)finish();});
  window.addEventListener('sa:language',()=>{if(ships.length)labels();});
  window.addEventListener('pagehide',()=>cancelAnimationFrame(frame));
  new ResizeObserver(resize).observe(canvas);
  // Read-only presentation diagnostics, useful for verifying the complete loop.
  window.HangarCombat=Object.freeze({snapshot:()=>({time,done,winning,running:!!frame,stats:{...stats},ships:ships.map(s=>({x:s.x,y:s.y,a:s.a,hp:s.hp,modules:s.parts.length}))})});
})();
