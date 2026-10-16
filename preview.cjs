// Local preview. Run: node preview.cjs
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const types = {'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.mp4':'video/mp4'};
http.createServer((req,res)=>{
  let pathname;
  try { pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname); } catch {res.writeHead(400).end();return;}
  const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end();return;}
  const stat=fs.statSync(file);const range=req.headers.range;
  const headers={'Content-Type':types[path.extname(file)]||'application/octet-stream','Accept-Ranges':'bytes'};
  if(range){
    const match=/^bytes=(\d+)-(\d*)$/.exec(range);
    if(!match){res.writeHead(416,{'Content-Range':`bytes */${stat.size}`}).end();return;}
    const start=Number(match[1]);const end=match[2]?Math.min(Number(match[2]),stat.size-1):stat.size-1;
    if(start>end||start>=stat.size){res.writeHead(416,{'Content-Range':`bytes */${stat.size}`}).end();return;}
    res.writeHead(206,{...headers,'Content-Range':`bytes ${start}-${end}/${stat.size}`,'Content-Length':end-start+1});fs.createReadStream(file,{start,end}).pipe(res);
  } else {res.writeHead(200,{...headers,'Content-Length':stat.size});fs.createReadStream(file).pipe(res);}
}).listen(4173,'127.0.0.1',()=>console.log('Space Arena preview: http://127.0.0.1:4173'));
