// Heuristic secret scan. Reports rule/path/line only, never matched secret values.
const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const rules=[
 ['private-key',/-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/],
 ['github-token',/\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{50,})\b/],
 ['cloud-key',/\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/],
 ['service-token',/\b(?:sk-(?:proj-)?[A-Za-z0-9_-]{32,}|xox[baprs]-[A-Za-z0-9-]{25,}|AIza[\w-]{30,})\b/],
 ['credential-in-url',/https?:\/\/[^\s/@:]+:[^\s/@]+@/],
 ['literal-secret',/\b(?:password|passwd|api[_-]?key|access[_-]?token|client[_-]?secret|auth[_-]?token)\s*[:=]\s*["'][^"'\r\n]{12,}["']/i]
];
function scan(text,label){
 if(text.includes('\0'))return [];
 const found=[];text.split(/\r?\n/).forEach((line,index)=>{
  for(const [rule,pattern]of rules)if(pattern.test(line))found.push({file:label,line:index+1,rule});
 });return found;
}
function audit(files,history=false){
 const findings=[];for(const file of files){if(fs.existsSync(path.join(root,file)))findings.push(...scan(fs.readFileSync(path.join(root,file),'utf8'),file));}
 if(history){
  const objects=execFileSync('git',['rev-list','--objects','--all'],{cwd:root,encoding:'utf8',maxBuffer:32*1024*1024}).trim().split('\n');
  const seen=new Set();
  for(const entry of objects){const [sha,...name]=entry.split(' ');if(seen.has(sha)||!name.length)continue;seen.add(sha);
   const type=execFileSync('git',['cat-file','-t',sha],{cwd:root,encoding:'utf8'}).trim();if(type!=='blob')continue;
   if(!/\.(?:js|cjs|mjs|json|html|css|md|txt|ya?ml|env|ini|conf)$/i.test(name.join(' ')))continue;
   findings.push(...scan(execFileSync('git',['cat-file','blob',sha],{cwd:root,encoding:'utf8',maxBuffer:40*1024*1024}),`history:${sha.slice(0,8)}:${name.join(' ')}`));
  }
 }
 return findings;
}
module.exports={audit};
if(require.main===module){const files=execFileSync('git',['ls-files'],{cwd:root,encoding:'utf8'}).trim().split(/\r?\n/);const findings=audit(files,process.argv.includes('--history'));console.log(JSON.stringify({files:files.length,history:process.argv.includes('--history'),findings},null,2));if(findings.length)process.exitCode=1;}
