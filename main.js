document.addEventListener('DOMContentLoaded', () => {

/* ============ 1. АНИМИРОВАННЫЙ ФОН С ЭФФЕКТАМИ ============ */
class BG {
  constructor(c){
    this.c=c; this.x=c.getContext('2d');
    this.stars=[]; this.parts=[]; this.shoots=[]; this.t=0;
    this.mx=null; this.my=null;
    this.rs(); this.mk(); this.ev(); this.loop();
  }
  rs(){ this.c.width=innerWidth; this.c.height=innerHeight; }
  mk(){
    this.stars=[]; this.parts=[];
    const n=Math.floor(innerWidth*innerHeight/12000);
    for(let i=0;i<Math.min(n,110);i++) this.parts.push({
      x:Math.random()*this.c.width, y:Math.random()*this.c.height,
      vx:(Math.random()-.5)*.35, vy:(Math.random()-.5)*.35,
      r:Math.random()*1.9+.5, o:Math.random()*.5+.2,
      ph:Math.random()*6.28, sp:Math.random()*.02+.008,
      hue:Math.random()<.25
    });
    for(let i=0;i<90;i++) this.stars.push({
      x:Math.random()*this.c.width, y:Math.random()*this.c.height,
      r:Math.random()*1.1+.3, ph:Math.random()*6.28, sp:Math.random()*.03+.01
    });
  }
  ev(){
    addEventListener('resize',()=>{this.rs();this.mk();});
    addEventListener('mousemove',e=>{this.mx=e.x;this.my=e.y;});
    addEventListener('mouseout',()=>{this.mx=this.my=null;});
  }
  loop(){
    this.t+=.016;
    const {x,c}= {x:this.x,c:this.c};
    x.clearRect(0,0,c.width,c.height);
    // stars twinkle
    for(const s of this.stars){
      s.ph+=s.sp;
      x.beginPath(); x.arc(s.x,s.y,s.r,0,6.29);
      x.fillStyle=`rgba(191,219,254,${.25+Math.sin(s.ph)*.2})`; x.fill();
    }
    // shooting star
    if(Math.random()<.006 && this.shoots.length<2)
      this.shoots.push({x:Math.random()*c.width*.7+c.width*.2,y:-20,vx:-7-Math.random()*4,vy:4+Math.random()*3,life:1});
    this.shoots=this.shoots.filter(s=>s.life>0);
    for(const s of this.shoots){
      s.x+=s.vx; s.y+=s.vy; s.life-=.012;
      const g=x.createLinearGradient(s.x,s.y,s.x-s.vx*12,s.y-s.vy*12);
      g.addColorStop(0,`rgba(165,243,252,${s.life})`); g.addColorStop(1,'rgba(59,130,246,0)');
      x.strokeStyle=g; x.lineWidth=2; x.beginPath();
      x.moveTo(s.x,s.y); x.lineTo(s.x-s.vx*12,s.y-s.vy*12); x.stroke();
    }
    // links
    for(let i=0;i<this.parts.length;i++)for(let j=i+1;j<this.parts.length;j++){
      const a=this.parts[i],b=this.parts[j],dx=a.x-b.x,dy=a.y-b.y,d=Math.hypot(dx,dy);
      if(d<110){ x.beginPath(); x.strokeStyle=`rgba(96,165,250,${(1-d/110)*.14})`; x.lineWidth=.6;
        x.moveTo(a.x,a.y); x.lineTo(b.x,b.y); x.stroke(); }
    }
    // particles
    for(const p of this.parts){
      p.ph+=p.sp; p.x+=p.vx; p.y+=p.vy;
      if(this.mx!=null){
        const dx=p.x-this.mx,dy=p.y-this.my,d=Math.hypot(dx,dy);
        if(d<140&&d>1){ p.x+=dx/d*.9; p.y+=dy/d*.9; }
      }
      if(p.x<0||p.x>c.width)p.vx*=-1; if(p.y<0||p.y>c.height)p.vy*=-1;
      const o=p.o+Math.sin(p.ph)*.15;
      x.beginPath(); x.arc(p.x,p.y,p.r,0,6.29);
      x.fillStyle=p.hue?`rgba(34,211,238,${o})`:`rgba(96,165,250,${o})`; x.fill();
      const g=x.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*4);
      g.addColorStop(0,p.hue?`rgba(34,211,238,${o*.35})`:`rgba(59,130,246,${o*.35})`);
      g.addColorStop(1,'rgba(59,130,246,0)');
      x.beginPath(); x.arc(p.x,p.y,p.r*4,0,6.29); x.fillStyle=g; x.fill();
    }
    requestAnimationFrame(()=>this.loop());
  }
}
new BG(document.getElementById('bg-canvas'));

/* ============ 2. СОСТОЯНИЕ ============ */
const $=id=>document.getElementById(id);
const store={
  get:(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v);}catch{return d;}},
  set:(k,v)=>localStorage.setItem(k,JSON.stringify(v))
};
const S={
  reg:store.get('reluxe_registered',false),
  user:store.get('reluxe_username',''),
  subExp:store.get('reluxe_sub_expires',null),
  freezeUntil:store.get('reluxe_freeze_until',null),
  nextReward:store.get('reluxe_next_reward',0),
  promos:store.get('reluxe_promos',[]),
  pendingFreeze:store.get('reluxe_pending_freeze',null),
  usedKeys:store.get('reluxe_used_keys',[]),
};
const DEMO_KEYS={
  'RELUXE-WELCOME-7D':{days:7},
  'RELUXE-VIP-30D':{days:30},
  'RELUXE-GIFT-1D':{days:1},
};
const save=()=>{
  store.set('reluxe_registered',S.reg); store.set('reluxe_username',S.user);
  store.set('reluxe_sub_expires',S.subExp); store.set('reluxe_freeze_until',S.freezeUntil);
  store.set('reluxe_next_reward',S.nextReward); store.set('reluxe_promos',S.promos);
  store.set('reluxe_pending_freeze',S.pendingFreeze); store.set('reluxe_used_keys',S.usedKeys);
};
let authMode='login';

function notify(msg,err){
  const n=$('notification'); n.textContent=msg;
  n.classList.remove('hidden'); n.classList.toggle('error',!!err);
  clearTimeout(n._t); n._t=setTimeout(()=>n.classList.add('hidden'),2800);
}

/* ============ 3. НАВИГАЦИЯ (фикс пустых вкладок) ============ */
function setView(v){
  document.querySelectorAll('.nav-link').forEach(b=>b.classList.toggle('active',b.dataset.view===v));
  ['home','products','profile','launcher'].forEach(k=>{
    const el=$(k+'-view'); if(el) el.classList.toggle('hidden',k!==v);
  });
  window.scrollTo({top:0,behavior:'smooth'});
}
document.querySelectorAll('.nav-link').forEach(b=>b.onclick=()=>setView(b.dataset.view));
document.querySelectorAll('[data-goto]').forEach(b=>b.onclick=()=>setView(b.dataset.goto));

function switchTab(t){
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.toggle('active',b.dataset.tab===t));
  document.querySelectorAll('.tab-pane').forEach(p=>p.classList.toggle('hidden',p.id!==t));
}
document.querySelectorAll('.tab-btn').forEach(b=>b.onclick=()=>switchTab(b.dataset.tab));

/* ============ 4. АВТОРИЗАЦИЯ ============ */
const authM=$('auth-modal');
function openAuth(){$('auth-modal').classList.remove('hidden');}
function closeAuth(){$('auth-modal').classList.add('hidden');}
$('auth-btn').onclick=openAuth;
$('gate-btn').onclick=openAuth;
$('user-chip').onclick=()=>setView('profile');
$('auth-close').onclick=closeAuth;
authM.onclick=e=>{if(e.target===authM)closeAuth();};
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeAuth();});
document.querySelectorAll('.auth-tab').forEach(t=>t.onclick=()=>{
  document.querySelectorAll('.auth-tab').forEach(x=>x.classList.toggle('active',x===t));
  authMode=t.dataset.mode;
  $('auth-title').textContent=authMode==='login'?'Вход':'Регистрация';
  $('auth-submit').textContent=authMode==='login'?'Войти':'Создать аккаунт';
});
$('auth-form').onsubmit=e=>{
  e.preventDefault();
  const u=$('username').value.trim(), p=$('password').value;
  if(!u||!p) return;
  if(u.length<6){notify('Ник должен быть минимум 6 символов',true);return;}
  if(u.toLowerCase()==='developer'){notify('Данный аккаунт принадлежит создателю, войти нельзя',true);return;}
  S.reg=true; S.user=u; save();
  $('username').value=''; $('password').value='';
  closeAuth(); refresh();
  notify(authMode==='login'?'С возвращением, '+u:'Аккаунт создан: '+u);
};

/* ============ 5. ПОДПИСКА + ЗАМОРОЗКА ============ */
function isFrozen(){ return S.freezeUntil && Date.now()<S.freezeUntil; }
function addSub(ms){
  const now=Date.now();
  const base=(S.subExp&&S.subExp>now)?S.subExp:now;
  S.subExp=base+ms; save(); refreshSub();
}
function fmtLeft(ms){
  const s=Math.max(0,Math.floor(ms/1000));
  const d=Math.floor(s/86400),h=Math.floor(s%86400/3600),m=Math.floor(s%3600/60),ss=s%60;
  if(d>0)return `${d}д ${h}ч ${m}м`;
  if(h>0)return `${h}ч ${m}м ${ss}с`;
  return `${m}м ${String(ss).padStart(2,'0')}с`;
}
function refreshSub(){
  const now=Date.now();
  const st=$('sub-status'), ex=$('sub-expiry'), fl=$('freeze-line'), uf=$('unfreeze-btn');
  if(S.subExp&&S.subExp>now){
    st.textContent='Подписка: активна';
    ex.textContent='Срок действия: '+fmtLeft(S.subExp-now);
  }else{
    st.textContent='Подписка: не активна'; ex.textContent='';
    if(S.subExp){S.subExp=null;save();}
  }
  if(isFrozen()){
    fl.classList.remove('hidden');
    fl.textContent='Заморозка до: '+new Date(S.freezeUntil).toLocaleString('ru-RU');
    uf.style.display='';
  }else{
    fl.classList.add('hidden');
    uf.style.display='none';
    if(S.freezeUntil){S.freezeUntil=null;save();}
  }
  $('profile-username').textContent=S.user||'Гость';
  const al=$('avatar-letter'); if(al) al.textContent=((S.user||'R')[0]||'R').toUpperCase();
}
$('unfreeze-btn').onclick=()=>{ // отморозить
  S.freezeUntil=null; save(); refreshSub(); notify('Подписка разморожена');
};
$('freeze-btn').onclick=()=>{
  if(!S.pendingFreeze){notify('Сначала выбей заморозку',true);return;}
  S.freezeUntil=Date.now()+S.pendingFreeze*86400000;
  S.pendingFreeze=null; save(); refreshSub(); renderFreezeBox();
  notify('Заморозка включена — дни и секунды не тратятся');
};
// тик: если заморозка — продлеваем expiry, чтобы время стояло
setInterval(()=>{
  if(S.subExp&&isFrozen()){ S.subExp+=1000; save(); }
  refreshSub(); renderCooldown();
},1000);

/* ============ 6. ПРОДУКТЫ ============ */
document.querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>{
  if(!S.reg){notify('Сначала зарегайся',true);openAuth();return;}
  window.open('https://t.me/chapmanclient1','_blank');
});

/* ============ 7. НАГРАДЫ — закрытые переворачивающиеся карточки ============ */
// пул: подписка пишется просто "Подписка", промокод генерится ReluxeXX, заморозка на 1 день
const POOL=[
  {id:'sub1', w:28, title:'Подписка', desc:'Подписка на 1 день — выдана моментально', days:1},
  {id:'sub2', w:18, title:'Подписка', desc:'Подписка на 2 дня — выдана моментально', days:2},
  {id:'sub12h', w:14, title:'Подписка', desc:'Подписка на 12 часов — выдана моментально', hours:12},
  {id:'promo5', w:14, title:'Промокод −5%', desc:'Промокод на скидку 5%', promo:5},
  {id:'freeze1', w:10, title:'Заморозка', desc:'Заморозка подписки на 1 день', freezeDays:1},
  {id:'sub7', w:5, title:'Подписка', desc:'Подписка на 7 дней — выдана моментально', days:7},
  {id:'promo10', w:5, title:'Промокод −10%', desc:'Промокод на скидку 10%', promo:10},
  {id:'freeze3', w:4, title:'Заморозка', desc:'Заморозка подписки на 3 дня', freezeDays:3},
];
function pickReward(){
  const total=POOL.reduce((a,r)=>a+r.w,0);
  let x=Math.random()*total;
  for(const r of POOL){ if((x-=r.w)<0) return r; }
  return POOL[0];
}
function genPromo(disc){
  const abc='ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s='';
  for(let i=0;i<2;i++)s+=abc[Math.floor(Math.random()*abc.length)];
  return disc===10?('Reluxe10-'+s):('Reluxe'+s);
}
function pluralDays(n){ return n+' '+(n===1?'день':(n<5?'дня':'дней')); }
function canOpen(){ return Date.now()>=(S.nextReward||0); }
function renderCooldown(){
  const pill=$('cooldown-pill');
  if(canOpen()){pill.textContent='Доступно сейчас';pill.classList.remove('wait');}
  else{
    pill.classList.add('wait');
    pill.textContent='Следующая через: '+fmtLeft(S.nextReward-Date.now());
  }
}
function renderPromos(){
  const box=$('promo-list');
  if(!S.promos.length){box.innerHTML='<p class="muted small">Пока пусто — выбей промокод в наградах.</p>';return;}
  box.innerHTML='';
  S.promos.forEach(code=>{
    const r=document.createElement('div');r.className='promo-row';
    const c=document.createElement('code');c.textContent=code;
    const b=document.createElement('button');b.textContent='Копировать';
    b.onclick=()=>{navigator.clipboard&&navigator.clipboard.writeText(code);notify('Скопировано: '+code);};
    r.append(c,b);box.append(r);
  });
}
function renderFreezeBox(){
  const box=$('freeze-box');
  box.classList.toggle('hidden',!S.pendingFreeze);
  if(S.pendingFreeze) $('freeze-btn').textContent='Включить заморозку на '+pluralDays(S.pendingFreeze);
}
function resetCards(){
  document.querySelectorAll('.flip-card').forEach(card=>{
    card.classList.remove('flipped','disabled','dim');
    card.querySelector('.rb-title').textContent='…';
    card.querySelector('.rb-desc').textContent='…';
    const old=card.querySelector('.rb-code'); if(old)old.remove();
  });
  $('reward-result').classList.add('hidden');
}
// клик по закрытой карточке — сразу переворот, без кнопки "применить"
document.querySelectorAll('.flip-card').forEach(card=>{
  card.onclick=()=>{
    if(!S.reg){notify('Сначала зарегайся',true);openAuth();return;}
    if(!canOpen()){notify('Награды доступны раз в 2 дня',true);return;}
    if(card.classList.contains('flipped'))return;
    // рандомная награда
    const rw=pickReward();
    // переворачиваем выбранную, остальные димим
    document.querySelectorAll('.flip-card').forEach(c=>{
      c.classList.add('disabled'); if(c!==card)c.classList.add('dim');
    });
    card.classList.add('flipped');
    card.querySelector('.rb-title').textContent=rw.title;
    card.querySelector('.rb-desc').textContent=rw.desc;
    // кулдаун 2 дня
    S.nextReward=Date.now()+2*864e5;
    // моментальная выдача
    let msg='';
    if(rw.days){addSub(rw.days*864e5);msg=`Выпала подписка на ${rw.days===1?'1 день':'2 дня'} — уже на аккаунте`;}
    else if(rw.hours){addSub(rw.hours*36e5);msg='Выпала подписка на 12 часов — уже на аккаунте';}
    else if(rw.promo){
      const code=genPromo(rw.promo);
      S.promos.push(code); msg='Выпал промокод на −'+rw.promo+'%: '+code+'. Покажи его при оплате в Telegram';
      const d=document.createElement('div');d.className='rb-code';d.textContent=code;
      card.querySelector('.flip-back').append(d);
      renderPromos(); switchTab('rewards');
    }
    else if(rw.freezeDays){
      S.pendingFreeze=rw.freezeDays; msg='Выпала заморозка на '+pluralDays(rw.freezeDays)+' — нажми кнопку ниже, чтобы включить';
    }
    save(); renderCooldown(); renderFreezeBox();
    const res=$('reward-result');
    res.textContent=msg; res.classList.remove('hidden');
    notify('Награда получена');
    // через 3 сек сбросить визуал (кулдаун останется)
    setTimeout(()=>{ if(!canOpen()) resetCards(); },6000);
  };
});

/* ============ 8. ПРОМОКОДЫ И КЛЮЧИ ============ */
$('activate-promo').onclick=()=>{
  const v=($('promo-input').value||'').trim();
  if(!v)return;
  if(v.toLowerCase()==='rel'){addSub(6e4);$('promo-input').value='';notify('Вы активировали подписку и её срок: 1 минута');return;}
  // свои сгенерированные вида ReluxeXX — скидка 5%
  const found=S.promos.find(p=>p.toLowerCase()===v.toLowerCase());
  if(found){
    $('promo-input').value='';
    const disc=/^reluxe10-/i.test(found)?10:5;
    notify('Промокод '+found+' применён: скидка '+disc+'%. Покажи его при оплате в Telegram');
    return;
  }
  notify('Неверный промокод',true);
};
$('activate-key').onclick=()=>{
  const k=(($('key-input').value||'').trim().toUpperCase());
  if(!k) return;
  if(!S.reg){notify('Сначала зарегайся',true);openAuth();return;}
  const d=DEMO_KEYS[k];
  if(!d){notify('Неверный ключ',true);return;}
  if(S.usedKeys.includes(k)){notify('Ключ уже активирован',true);return;}
  S.usedKeys.push(k); addSub(d.days*864e5); $('key-input').value=''; save();
  notify('Ключ активирован: +'+pluralDays(d.days)+' подписки');
};

/* ============ 9. ОБНОВЛЕНИЕ UI ============ */
function refresh(){
  $('auth-btn').classList.toggle('hidden',S.reg);
  $('user-chip').classList.toggle('hidden',!S.reg);
  if(S.reg)$('user-chip').textContent=S.user||'Профиль';
  $('gate-section').classList.toggle('hidden',S.reg);
  document.querySelectorAll('.btn-buy').forEach(b=>b.disabled=false);
  refreshSub(); renderCooldown(); renderPromos(); renderFreezeBox();
}
$('gate-section')&&refresh();
refresh();
setView('home');

});
