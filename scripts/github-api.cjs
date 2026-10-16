// Credentials are read from the existing credential manager, kept in memory, never logged.
const {spawnSync}=require('node:child_process');
async function request(method,route,body){
 if(!/^(GET|POST|PUT|PATCH)$/.test(method)||route.startsWith('/')||route.includes('://'))throw Error('Invalid GitHub API request');
 let token=process.env.GH_TOKEN||process.env.GITHUB_TOKEN;
 if(!token){
  const result=spawnSync('git',['credential','fill'],{input:'protocol=https\nhost=github.com\n\n',encoding:'utf8',windowsHide:true,env:{...process.env,GIT_TERMINAL_PROMPT:'0',GCM_INTERACTIVE:'Never'}});
  if(result.status!==0)throw Error('GitHub authentication is required in Git Credential Manager. Do not paste credentials into chat.');
  token=result.stdout.split(/\r?\n/).find(line=>line.startsWith('password='))?.slice(9);
 }
 if(!token)throw Error('No GitHub credential available');
 const response=await fetch('https://api.github.com/'+route,{method,headers:{Authorization:'Bearer '+token,'User-Agent':'SpaceArena-Pages','X-GitHub-Api-Version':'2022-11-28',Accept:'application/vnd.github+json',...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});
 const text=await response.text();let data;try{data=JSON.parse(text);}catch{data={message:'Non-JSON response',status:response.status};}
 if(!response.ok)throw Error(`GitHub ${response.status}: ${data.message||'Request failed'}`);
 return data;
}
module.exports=request;
if(require.main===module){const [method,route,body]=process.argv.slice(2);request(method,route,body?JSON.parse(body):undefined).then(data=>console.log(JSON.stringify(data))).catch(error=>{console.error(error.message);process.exitCode=1;});}
