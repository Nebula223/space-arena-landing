// Static dependency inventory shared by the Pages build and sanitized publication.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const legacy=new Map([
 ['_PromoRes/Корабли/DeathStar.png','assets/legacy/DeathStar.png'],
 ...['Weapons/Railgun_2x2_01.png','Weapons/Missile_Turret2x2.png','Defense/Shield2x2.png','Defense/Heavy_Armor2x2.png','Utility/Reactor2x2.png','Utility/WarpEngine2x2.png'].map(file=>['_PromoRes/Модули/'+file,'assets/legacy/'+path.posix.basename(file)]),
 ['_PromoRes/Video/2020-07-28%2011-47-47.mp4','hangar/assets/gameplay.mp4']
]);
function transform(text,file){if(file==='index.html'||file==='script.js')for(const [from,to]of legacy)text=text.replaceAll(from,to);return text;}
function walk(dir){return fs.readdirSync(path.join(root,dir),{withFileTypes:true}).flatMap(e=>e.name==='qa'||e.name==='screenshots'?[]:e.isDirectory()?walk(path.posix.join(dir,e.name)):[path.posix.join(dir,e.name)]);}
function references(text){
 const refs=[];
 for(const match of text.matchAll(/["'(`]([^"'()`\r\n<>]+?\.(?:html|css|js|json|webp|png|jpe?g|svg|ttf|woff2?|mp4))(?:[?#][^"'()`\s]*)?(?=["')`])/g)){
  const ref=match[1].replace(/^\d+;\s*url=/i,'');if(/^(?:[a-z]+:|\/\/)/i.test(ref)||/[${}]/.test(ref)||/\s/.test(ref))continue;
  assert(!ref.startsWith('/'),'Root-relative resource would escape a project Pages URL: '+ref);refs.push(decodeURIComponent(ref));
 }return refs;
}
function inventory(){
 const pages=walk('promo-full').filter(f=>f.endsWith('.html'));
 const extra=[];
 for(const font of ['Manrope','RobotoCondensed'])extra.push(`art-directions/assets/${font}-LICENSE.txt`);
 extra.push('promo-full/assets/icons/LUCIDE-LICENSE.txt','promo-full/assets/icons/SIMPLE-ICONS-LICENSE.txt');
 const queue=[...pages,...extra],files=new Set();
 while(queue.length){const file=queue.shift();if(files.has(file))continue;
  assert(!file.startsWith('../')&&!path.isAbsolute(file)&&!file.split('/').some(p=>p.startsWith('.')),'Unsafe site path: '+file);
  assert(!/\b(?:qa|node_modules|exports|_PromoRes|References|Pirate_Reference)\b/.test(file),'Forbidden runtime dependency: '+file);
  assert(fs.existsSync(path.join(root,file))&&fs.statSync(path.join(root,file)).isFile(),'Missing runtime dependency: '+file);
  files.add(file);
  if(/\.(html|css|js|json)$/.test(file))for(const ref of references(transform(fs.readFileSync(path.join(root,file),'utf8'),file)))queue.push(path.posix.normalize(path.posix.join(path.posix.dirname(file),ref)));
 }
 return {files:[...files].sort(),pages:pages.sort()};
}
module.exports={root,inventory,transform,references};
if(require.main===module){const data=inventory();console.log(JSON.stringify({...data,bytes:data.files.reduce((n,f)=>n+fs.statSync(path.join(root,f)).size,0)},null,2));}
