const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {references}=require('./site-files.cjs'),out=path.resolve(__dirname,'../dist');
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
let links=0;
function check(file,ref){
 if(!ref||ref.startsWith('#')||/^(?:[a-z]+:|\/\/)/i.test(ref))return;
 assert(!ref.startsWith('/'),'Root-relative link escapes repository base: '+ref);
 const clean=decodeURIComponent(ref.split(/[?#]/)[0]);if(!clean)return;
 const target=path.resolve(path.dirname(file),clean);assert(target.startsWith(out+path.sep)||target===out,'Outside dist: '+ref);
 assert(fs.existsSync(target),'Missing '+path.relative(out,file)+' -> '+ref);
 if(fs.statSync(target).isDirectory())assert(fs.existsSync(path.join(target,'index.html')),'Directory has no index: '+ref);
 links++;
}
for(const file of walk(out)){
 assert(!/(?:^|[\\/])(?:\.git|qa|exports|node_modules|_PromoRes|References|Pirate_Reference)(?:[\\/]|$)/.test(path.relative(out,file)),'Private directory in site');
 if(!/\.(html|css|js|json)$/.test(file))continue;
 const text=fs.readFileSync(file,'utf8');for(const ref of references(text))check(file,ref);
 if(file.endsWith('.html'))for(const match of text.matchAll(/\b(?:href|src|poster)="([^"<>]*)"/g))check(file,match[1]);
}
const required=['promo-full/index.html','promo-full/news-v2.html','promo-full/faq-v2.html',...['update-331','update-330','limit-breakers','space-legends'].map(id=>`promo-full/news/${id}/index.html`)];
for(const file of required)assert(fs.existsSync(path.join(out,file)),'Missing direct route: '+file);
console.log(JSON.stringify({requiredRoutes:required.length,localDependencies:links,result:'passed'}));
