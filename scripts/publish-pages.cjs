// Maintain a sanitized public history without rewriting the local design branch.
// No checkout, reset, force push, branch deletion or second repository is used.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const {root,inventory}=require('./site-files.cjs'),{audit}=require('./audit-publication.cjs');
function git(args,options={}){return execFileSync('git',args,{cwd:root,encoding:'utf8',windowsHide:true,...options}).trim();}
const tooling=['.gitignore','.gitattributes','.github/workflows/pages.yml','README.md','DEPLOYMENT.md','preview.cjs',...['site-files','audit-publication','build-pages','check-pages','github-api','publish-pages'].map(name=>`scripts/${name}.cjs`)];
const files=[...inventory().files,...tooling].sort();
const findings=audit(files);assert.equal(findings.length,0,JSON.stringify(findings));
assert.equal(git(['status','--porcelain','--untracked-files=no']),'','Commit source changes before preparing publication');
for(const file of files){assert(fs.existsSync(path.join(root,file)),'Missing public file '+file);git(['ls-files','--error-unmatch','--',file]);}
const branch='refs/heads/publish/github-pages';let parent='';try{parent=git(['rev-parse','--verify','--quiet',branch]);}catch{}
// Git's alternate index isolates the public tree from the user's real staging area.
const index=path.resolve(root,git(['rev-parse','--git-path','spacearena.publish-index']));
assert(!fs.existsSync(index),'Publication scratch index already exists; inspect before retrying');
const env={...process.env,GIT_INDEX_FILE:index};
git(['read-tree','--empty'],{env});git(['add','--',...files],{env});const tree=git(['write-tree'],{env});
let commit=parent;
if(!parent||git(['rev-parse',parent+'^{tree}'])!==tree){
 commit=git(['commit-tree',tree,...(parent?['-p',parent]:[]),'-m',`Publish audited Space Arena snapshot (${git(['rev-parse','--short','HEAD'])})`]);
 git(['update-ref',branch,commit,...(parent?[parent]:[])]);
}
// Remove only the exact temporary index created by this process; never the real index.
fs.unlinkSync(index);
if(process.argv.includes('--push'))git(['push','origin',`${branch}:refs/heads/main`],{stdio:['ignore','pipe','pipe']});
console.log(JSON.stringify({branch:'publish/github-pages',commit,files:files.length,pushed:process.argv.includes('--push')}));
