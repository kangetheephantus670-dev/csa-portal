'use strict';
function showTab(t){
  document.getElementById('form-login').style.display=t==='login'?'':'none';
  document.getElementById('form-signup').style.display=t==='signup'?'':'none';
  document.getElementById('tab-login').classList.toggle('on',t==='login');
  document.getElementById('tab-signup').classList.toggle('on',t==='signup');
}
function doLogin(){
  const u=(document.getElementById('l-user').value||'').trim();
  const p=document.getElementById('l-pass').value||'';
  const err=document.getElementById('login-err');
  const btn=document.getElementById('btn-login');
  const btxt=document.getElementById('btn-login-txt');
  err.textContent='';
  if(!u)return(err.textContent='Weka jina la mtumiaji.');
  if(p.length<4)return(err.textContent='Neno la siri liwe na herufi 4+.');
  btn.disabled=true;btxt.textContent='Inaingia…';
  setTimeout(()=>{
    if(u.toLowerCase()==='ephantus'&&p==='m673'){
      saveSession(OWNER);
      if(document.getElementById('l-remember').checked)saveSession(OWNER);
      DB.log('Ephantus ameingia','🔐');
      window.location.href='dashboard.html';return;
    }
    const db=DB.get();
    const dir=db.directors.find(d=>(d.username||'').toLowerCase()===u.toLowerCase()&&d.password===p);
    if(dir){
      saveSession(dir);
      if(document.getElementById('l-remember').checked)saveSession(dir);
      DB.log(dir.name+' ameingia','🔐');
      window.location.href='dashboard.html';return;
    }
    btn.disabled=false;btxt.textContent='Ingia';
    err.textContent='Jina au neno la siri si sahihi.';
  },400);
}
function doSignUp(){
  const name=(document.getElementById('su-name').value||'').trim();
  const uname=(document.getElementById('su-uname').value||'').trim();
  const pass=document.getElementById('su-pass').value||'';
  const code=(document.getElementById('su-code').value||'').trim();
  const err=document.getElementById('signup-err');
  err.textContent='';
  if(!name)return(err.textContent='Weka jina kamili.');
  if(!uname)return(err.textContent='Weka jina la mtumiaji.');
  if(pass.length<4)return(err.textContent='Neno la siri liwe na herufi 4+.');
  if(code!==INVITE_CODE)return(err.textContent='Msimbo wa karibisho si sahihi. Omba kutoka kwa Ephantus.');
  const db=DB.get();
  if(db.directors.find(d=>(d.username||'').toLowerCase()===uname.toLowerCase()))
    return(err.textContent='Jina hilo la mtumiaji lipo tayari. Chagua jingine.');
  const newDir={uid:'dir_'+Date.now(),name,username:uname,password:pass,role:'director',addedAt:Date.now(),addedBy:'self-signup'};
  DB.update(d=>d.directors.push(newDir));
  saveSession(newDir);
  DB.log(name+' amejisajili','✅');
  window.location.href='dashboard.html';
}
document.addEventListener('DOMContentLoaded',()=>{
  if(getSession())window.location.href='dashboard.html';
  document.getElementById('l-user').focus();
});
