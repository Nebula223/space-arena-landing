/* Deliberately illustrative model. These values are NOT Space Arena balance. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.HangarBattle=factory();})(globalThis,function(){
 'use strict';
 function profile(items){
  const count=type=>items.filter(i=>i.type===type).length;
  const weapons=items.filter(i=>['cannon','laser','weapon'].includes(i.type));
  const damage=weapons.reduce((sum,i)=>sum+({cannon:4,laser:7,weapon:12}[i.type]),0);
  const powered=count('power-core')>0;
  return {weapons,damage:damage*(powered?1:.45),powered,shield:count('shield')*18,health:80+count('armor')*12,engines:count('thruster'),armor:count('armor'),modules:items.length};
 }
 function create(items){const p=profile(items);return {profile:p,turn:0,playerHP:p.health,enemyHP:70,shield:p.shield,done:false,won:false,log:[],events:[]};}
 function step(s){
  if(s.done)return s;
  s.turn++;s.events=[];
  if(s.profile.damage>0){s.enemyHP=Math.max(0,s.enemyHP-s.profile.damage);s.events.push('fire');}
  if(s.enemyHP===0){s.done=true;s.won=true;}
  else{
   const dodge=s.profile.engines>0&&s.turn%4===0;
   if(dodge)s.events.push('dodge');
   else{let hit=8;const absorbed=Math.min(s.shield,hit);s.shield-=absorbed;hit-=absorbed;s.playerHP=Math.max(0,s.playerHP-hit);s.events.push(absorbed?'shield':'hit');}
   if(s.playerHP===0||s.turn>=12){s.done=true;s.won=false;}
  }
  s.log.push({turn:s.turn,playerHP:s.playerHP,enemyHP:s.enemyHP,shield:s.shield});return s;
 }
 function finish(s){while(!s.done)step(s);return s;}
 function advice(s){return !s.profile.weapons.length?'weapon':!s.profile.powered?'power':!s.won&&!s.profile.shield&&!s.profile.armor?'defense':!s.won?'firepower':'experiment';}
 return {profile,create,step,finish,advice};
});
