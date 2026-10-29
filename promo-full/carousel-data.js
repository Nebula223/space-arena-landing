// Content only: change these arrays to replace or add slides.
(() => {
 const data={forge:[
  {id:'supreme',wide:'assets/supreme-wide.webp',mobile:'assets/supreme-square.webp',label:{ru:'Supreme',en:'Supreme'},alt:{ru:'Supreme и его оснащение',en:'Supreme and its equipment'}},
  {id:'vega',wide:'assets/vega-wide.webp',mobile:'assets/vega-square.webp',label:{ru:'Vega',en:'Vega'},alt:{ru:'Vega и его оснащение',en:'Vega and its equipment'}},
  {id:'miran',wide:'../art-directions/assets/modules.webp',mobile:'../art-directions/assets/modules-mobile.webp',label:{ru:'Ещё одна сборка',en:'Another build'},alt:{ru:'Другой корпус и его оснащение',en:'Another hull and its equipment'}}
 ],gallery:[
  {id:'map',src:'../assets/screenshots/scene-6.webp',srcRu:'../assets/screenshots/scene-6-ru.webp',caption:{ru:'Карта кампании',en:'Campaign map'}},
  {id:'clans',src:'../assets/screenshots/scene-5.webp',srcRu:'../assets/screenshots/scene-5-ru.webp',caption:{ru:'Противостояние кланов',en:'Clan confrontation'}}
 ]};
 if(typeof module!=='undefined'&&module.exports)module.exports=data;else window.SPACE_ARENA_CAROUSEL_DATA=data;
})();
