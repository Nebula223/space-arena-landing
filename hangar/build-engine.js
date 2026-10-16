/* Geometry only: shared by the local page and the placement checks. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ShipBuilder = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const shape = [
    '0000110000',
    '0001111000',
    '0011111100',
    '0011111100',
    '1111111111',
    '1111111111',
    '1111111111',
    '0111111110',
    '0111001110',
    '0111001110'
  ];
  const catalog = {
    cannon: {w:1,h:1,category:'weapon',ru:'Пушка',en:'Cannon',description:['Компактное оружие: одна клетка, которую легко найти в сборке.','A compact weapon: a single square that fits into small spaces.']},
    laser: {w:1,h:2,category:'weapon',ru:'Лазер',en:'Laser',description:['Узкий модуль занимает две клетки. Поверни его, чтобы вписать в корпус.','A narrow module uses two squares. Rotate it to fit your layout.']},
    weapon: {w:2,h:2,category:'weapon',ru:'Рельсотрон',en:'Railgun',description:['Четыре клетки под оружие. Оставь место для остальных систем.','Four squares of weaponry. Leave room for the other systems.']},
    shield: {w:2,h:2,category:'shield',ru:'Щит',en:'Shield',description:['Защита тоже занимает место. Найди для неё свободный участок 2 × 2.','Protection needs room too. Find a free 2 × 2 area.']},
    'power-core': {w:3,h:3,category:'reactor',ru:'Реактор',en:'Reactor',description:['Большому реактору нужен цельный участок из девяти свободных клеток.','A large reactor needs a continuous area of nine free squares.']},
    thruster: {w:2,h:3,category:'engine',ru:'Двигатель',en:'Engine',description:['Шесть клеток для двигателя. Сравни продольное и поперечное размещение.','Six squares for an engine. Try both orientations.']},
    armor: {w:1,h:1,category:'armor',ru:'Броня',en:'Armor',description:['Заполни небольшие промежутки между крупными модулями.','Fill the small gaps between larger modules.']}
  };
  const initial = [
    {id:1,type:'cannon',r:0,c:4,rotated:false},
    {id:2,type:'cannon',r:0,c:5,rotated:false},
    {id:3,type:'power-core',r:3,c:3,rotated:false},
    {id:4,type:'shield',r:5,c:6,rotated:false},
    {id:5,type:'thruster',r:7,c:1,rotated:false}
  ];
  function size(type, rotated=false) { const {w,h}=catalog[type];return rotated?{w:h,h:w}:{w,h}; }
  function cells(item) {
    const {w,h}=size(item.type,item.rotated), result=[];
    for(let r=item.r;r<item.r+h;r++) for(let c=item.c;c<item.c+w;c++) result.push({r,c});
    return result;
  }
  function at(items,r,c,ignoreId=null) { return items.find(item=>item.id!==ignoreId&&cells(item).some(cell=>cell.r===r&&cell.c===c)); }
  function check(items,item,ignoreId=null) {
    const footprint=cells(item);
    const outside=footprint.some(({r,c})=>shape[r]?.[c]!=='1');
    const overlap=footprint.some(({r,c})=>at(items,r,c,ignoreId));
    return {valid:!outside&&!overlap,reason:outside?'outside':overlap?'overlap':'valid',cells:footprint};
  }
  return {shape,catalog,initial,size,cells,at,check};
});
