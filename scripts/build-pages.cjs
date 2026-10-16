// Buildless website: copy the audited runtime graph, preserve real nested HTML routes.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {root,inventory,transform}=require('./site-files.cjs'),{audit}=require('./audit-publication.cjs');
const out=path.join(root,'dist'),data=inventory();
const findings=audit(data.files);assert.equal(findings.length,0,JSON.stringify(findings));
if(fs.existsSync(out))assert(fs.readdirSync(out).length===0,'dist already exists: use a fresh checkout/build directory; do not mix old and new builds.');
fs.mkdirSync(out,{recursive:true});
for(const file of data.files){const target=path.join(out,file);fs.mkdirSync(path.dirname(target),{recursive:true});
 if(/\.(html|css|js|json)$/.test(file))fs.writeFileSync(target,transform(fs.readFileSync(path.join(root,file),'utf8'),file));else fs.copyFileSync(path.join(root,file),target);
}
fs.copyFileSync(path.join(out,'index.html'),path.join(out,'classic.html'));
fs.writeFileSync(path.join(out,'index.html'),'<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0;url=promo-full/index.html"><title>Space Arena</title></head><body><a href="promo-full/index.html">Space Arena — Concept D</a></body></html>');
const routes=[['Concept D','promo-full/index.html'],['News','promo-full/news-v2.html'],['FAQ','promo-full/faq-v2.html'],['Interactive Demo','interactive-demo/index.html'],['Hangar','hangar/index.html'],['Alternative','alternative/index.html'],['Art directions A / B / C','art-directions/index.html'],['Original concept','classic.html']];
fs.writeFileSync(path.join(out,'START-HERE.html'),`<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Space Arena — Demo</title><style>body{max-width:800px;margin:50px auto;padding:24px;background:#050c16;color:#edf5f7;font:18px/1.8 system-ui}a{display:block;padding:12px 0;color:#92e3ef}</style></head><body><h1>Space Arena — Demo</h1>${routes.map(([label,url])=>`<a href="${url}">${label}</a>`).join('')}</body></html>`);
fs.writeFileSync(path.join(out,'.nojekyll'),'');
fs.writeFileSync(path.join(out,'404.html'),'<!doctype html><html><head><meta charset="utf-8"><title>Page not found — Space Arena</title></head><body><h1>404 — Page not found</h1><p>Open the exact demo link supplied to you. This site uses real HTML pages, not SPA routing.</p></body></html>');
fs.writeFileSync(path.join(out,'site-manifest.json'),JSON.stringify({pages:[...data.pages.filter(p=>p!=='index.html'),'index.html','classic.html','START-HERE.html'],files:data.files.length},null,2));
console.log(JSON.stringify({output:'dist',files:data.files.length,bytes:data.files.reduce((n,f)=>n+fs.statSync(path.join(root,f)).size,0),pages:data.pages.length+2}));
