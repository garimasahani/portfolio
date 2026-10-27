/* Spec Lab: the interactive mocks, carried over from the first version of the site */
(()=>{
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
/* ---------- lab tabs ---------- */
const tabs=$$('.tab'),panels=$$('#lab .stage');
function openTab(key,scroll){tabs.forEach(t=>{const on=t.dataset.key===key;t.setAttribute('aria-selected',on);t.tabIndex=on?0:-1});
 panels.forEach(p=>p.hidden=p.id!=='p-'+key);
 if(scroll)$('#t-'+key).scrollIntoView({block:'nearest',inline:'center',behavior:reduce?'auto':'smooth'});}
tabs.forEach((t,i)=>{t.addEventListener('click',()=>openTab(t.dataset.key));
 t.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){const n=tabs[(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length];n.focus();openTab(n.dataset.key,true)}})});
const h=location.hash.slice(1);openTab(tabs.some(t=>t.dataset.key===h)?h:'znmd');
if(tabs.some(t=>t.dataset.key===h))setTimeout(()=>$('#lab').scrollIntoView(),50);

/* ---------- Spotify A/B ---------- */
let variant='A',started=0,shownAt=performance.now(),firstDl=null,playing=false;
const dlBtn=$('#dlBtn'),toast=$('#toast');
const covers=['linear-gradient(135deg,#f6d365,#fda085)','linear-gradient(135deg,#84fab0,#8fd3f4)','linear-gradient(135deg,#a18cd1,#fbc2eb)','linear-gradient(135deg,#30cfd0,#330867)','linear-gradient(135deg,#ff9a9e,#fad0c4)','linear-gradient(135deg,#667eea,#764ba2)','linear-gradient(135deg,#43e97b,#38f9d7)'];
const T=[['Kesar Skies','Lo-fi Bombay','song',2],['The Daily Commute','Podcast · Ep 112','pod',41],['Monsoon Window','Indigo Avenue','song',1],['Founder Stories','Podcast · Ep 58','pod',63],['Late Train Home','Indigo Avenue','song',0],['Highway 48','The Nomad Club','song',38],['Run Club Mix','Playlist · 42 songs','song',4]];
let tracks=[],filt='All',smart=false,expire=false;
function resetTracks(){tracks=T.map((t,i)=>({n:t[0],a:t[1],k:t[2],d:t[3],c:covers[i],gone:false}))}
function renderLib(){const L=$('#trkList');L.innerHTML='';
 tracks.filter(t=>filt==='All'||(filt==='Songs'&&t.k==='song')||(filt==='Podcasts'&&t.k==='pod')||(filt==='Unplayed'&&t.d>=25)||(filt==='Expiring'&&t.d>=30)).forEach(t=>{const d=document.createElement('div');d.className='trk'+(t.gone?' gone':'');
  const exp=variant==='B'&&expire&&t.d>=30?'':(variant==='B'&&t.d>=25?`<span class="exp"> · unplayed ${t.d}d</span>`:'');
  d.innerHTML=`<span class="cov" style="background:${t.c}"></span><div><b>${t.n}</b><span>${t.a}</span>${exp}</div><span class="dot"></span>`;L.appendChild(d)});
 const used=Math.min(30,28-(tracks.filter(t=>t.gone).length*4)+(smart?2:0));
 $('#qTxt').textContent=used+' / 30 songs';$('#qBar i').style.width=(used/30*100)+'%';
 $('#qBar').classList.toggle('full',used>=28);$('#qWarn').textContent=used>=30?'Full':used>=28?'Almost full':'Room for '+(30-used)+' more';}
function setVariant(v){variant=v;$$('[data-variant]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.variant===v));
 dlBtn.hidden=v==='A';$('#missNote').hidden=v==='B';$('#smartBox').hidden=v==='A';$('#libFilters').innerHTML=v==='A'?'<button class="on">All</button><button>Songs</button><button>Podcasts</button>':'<button class="on">All</button><button>Songs</button><button>Podcasts</button><button>Unplayed</button><button>Expiring</button>';
 bindFilters();filt='All';smart=false;expire=false;$('#togSmart').setAttribute('aria-checked','false');$('#togExpire').setAttribute('aria-checked','false');
 dlBtn.classList.remove('loading','done');dlBtn.classList.toggle('dl-new',v==='B');$('#dlIcon').innerHTML='<path d="M12 5v12M7 12l5 5 5-5"/>';
 started=0;firstDl=null;shownAt=performance.now();$('#cInit').textContent='0';$('#cTime').textContent='–';resetTracks();renderLib();
 $('#spotCap').textContent=v==='A'?"Variant A is today's app. Switch to B, then tap the new download button on the track, and check the Downloads tab.":'Variant B: tap the download button beside the track. In Downloads, try Smart downloads and Auto-expire.';}
function bindFilters(){$$('#libFilters button').forEach(b=>b.addEventListener('click',()=>{$$('#libFilters button').forEach(x=>x.classList.remove('on'));b.classList.add('on');filt=b.textContent;renderLib()}))}
$$('[data-variant]').forEach(b=>b.addEventListener('click',()=>setVariant(b.dataset.variant)));
dlBtn.addEventListener('click',()=>{if(dlBtn.classList.contains('loading'))return;
 if(dlBtn.classList.contains('done')){dlBtn.classList.remove('done');$('#dlIcon').innerHTML='<path d="M12 5v12M7 12l5 5 5-5"/>';return}
 dlBtn.classList.remove('dl-new');dlBtn.classList.add('loading');started++;$('#cInit').textContent=started;
 if(firstDl===null){firstDl=(performance.now()-shownAt)/1000;$('#cTime').textContent=firstDl<60?firstDl.toFixed(1)+'s':Math.round(firstDl/60)+'m'}
 setTimeout(()=>{dlBtn.classList.remove('loading');dlBtn.classList.add('done');$('#dlIcon').innerHTML='<path d="M5 12l5 5 9-10"/>';toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),1800)},reduce?50:1300)});
$('#playBtn').addEventListener('click',()=>{playing=!playing;$('#art').classList.toggle('playing',playing);$('#scrub').classList.toggle('playing',playing);
 $('#playIc').innerHTML=playing?'<path d="M7 4h4v16H7zM14 4h4v16h-4z"/>':'<path d="M7 4v16l13-8z"/>';$('#playBtn').setAttribute('aria-label',playing?'Pause':'Play')});
$$('.tabbar button').forEach(b=>b.addEventListener('click',()=>{$$('.tabbar button').forEach(x=>x.classList.toggle('on',x===b));$('#vNow').hidden=b.dataset.view!=='vNow';$('#vLib').hidden=b.dataset.view!=='vLib'}));
$('#togSmart').addEventListener('click',e=>{smart=!smart;e.currentTarget.setAttribute('aria-checked',smart);
 if(smart&&!tracks.some(t=>t.n==='On Repeat')){tracks.unshift({n:'On Repeat',a:'Smart download · updated today',k:'song',d:0,c:'linear-gradient(135deg,#1ed760,#0b5e2a)',gone:false})}
 if(!smart)tracks=tracks.filter(t=>t.n!=='On Repeat');renderLib()});
$('#togExpire').addEventListener('click',e=>{expire=!expire;e.currentTarget.setAttribute('aria-checked',expire);tracks.forEach(t=>t.gone=expire&&t.d>=30);renderLib()});
setVariant('A');

/* ---------- Premium psychology ---------- */
$$('[data-psy]').forEach(b=>b.addEventListener('click',()=>{$$('[data-psy]').forEach(x=>x.setAttribute('aria-pressed',x===b));
 $$('[data-psy-panel]').forEach(p=>p.hidden=p.dataset.psyPanel!==b.dataset.psy);if(b.dataset.psy!=='film')stopFilm()}));
const scenes=$$('#film .scene'),dots=$$('#filmDots button');
const narr=['Scene 1 · A dim room. Friends and family whisper, waiting for the big reveal.','Scene 2 · Lights on. "Happy Birthday!" Everyone cues up the birthday song…','Scene 3 · …and a loud car-insurance ad blares instead. Excitement turns to awkward laughter.','End card · "Don\'t let ads ruin your perfect birthday surprises." Switch to Spotify Premium.'];
let sc=0,fTimer=null;
function showScene(i){sc=i;scenes.forEach((s,j)=>s.classList.toggle('on',j===i));dots.forEach((d,j)=>{d.classList.toggle('on',j<i);d.classList.remove('run')});
 if(fTimer){void dots[i].offsetWidth;dots[i].classList.add('run')}$('#filmNarr').textContent=narr[i];}
function stopFilm(){clearTimeout(fTimer);fTimer=null;$('#filmPlay').innerHTML='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4v16l13-8z"/></svg>';dots.forEach(d=>d.classList.remove('run'))}
function step(){fTimer=setTimeout(()=>{if(sc<3){showScene(sc+1);step()}else stopFilm()},3000)}
$('#filmPlay').addEventListener('click',()=>{if(fTimer){stopFilm();return}
 if(sc===3)sc=-1;fTimer=1;$('#filmPlay').innerHTML='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4h4v16H7zM14 4h4v16h-4z"/></svg>';showScene(sc+1);step()});
dots.forEach((d,i)=>d.addEventListener('click',()=>{stopFilm();showScene(i)}));

$('#ftPush').addEventListener('click',()=>{const a=$('#ftArea');if($('.ft-open',a))return;$('#ftPush').classList.add('sel');
 const d=document.createElement('div');d.className='ft-open';
 d.innerHTML='<div class="row"><span class="cov"></span><div><b>Tum Se Hi</b><span>Your #1 song of 2019<span class="eq paused" id="eq"><i></i><i></i><i></i></span></span></div><button class="pbtn" id="ftPlay" aria-label="Play"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M7 4v16l13-8z"/></svg></button></div><div class="why">You last listened to this in 2019. It was one of your top songs back then.</div>';
 a.appendChild(d);
 $('#ftPlay').addEventListener('click',e=>{const eq=$('#eq');const p=eq.classList.toggle('paused');e.currentTarget.innerHTML=p?'<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M7 4v16l13-8z"/></svg>':'<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M7 4h4v16H7zM14 4h4v16h-4z"/></svg>'})});

const H=[['💪','Workout Champ','Workout reminder','Plays the workout playlist daily during their workout'],['🌅','Morning Motivator','Morning alarm','Starts the day with a high-energy playlist'],['🚇','Commute Companion','Commute notification','Listens to a playlist or podcast on the way to work'],['🎯','Focus Master','Work or study reminder','Plays focus playlists while working or studying'],['🌙','Evening Relaxer','Evening wind-down reminder','Unwinds with calm music or podcasts each evening'],['🧭','Daily Discoverer','"New Music Alert"','Tries a new genre or artist every day'],['😴','Sleep Sounder','Bedtime reminder','Plays sleep or ambient music before bed'],['📤','Social Sharer','Sharing music','Shares playlists and favourite tracks with friends'],['🪩','Weekend Party Host','Weekend playlist pick','Plays party and upbeat music on weekends']];
const hb=$('#habits');H.forEach((x,i)=>{const b=document.createElement('button');b.className='habit';b.setAttribute('aria-pressed',i===0);b.innerHTML=`<span>${x[0]}</span>${x[1]}`;
 b.addEventListener('click',()=>{$$('.habit').forEach(y=>y.setAttribute('aria-pressed',y===b));showLoop(i)});hb.appendChild(b)});
function showLoop(i){const x=H[i];$('#loop').innerHTML=`<div><small>Cue</small>${x[2]}</div><div><small>Routine</small>${x[3]}</div><div><small>Reward</small>The "${x[1]}" title on their profile</div>`}
showLoop(0);

let charm=false;$('#charmBtn').addEventListener('click',()=>{charm=!charm;
 $('#charmPr').innerHTML=charm?'<s>₹130</s> ₹129<small>per month</small>':'₹130<small>per month</small>';
 $('#charmTxt').textContent=charm?'Reads as "one-twenty-something". Feels cheaper and more accessible for ₹1.':'A round number reads as "₹130".';
 $('#charmBtn').textContent=charm?'Undo':'Apply charm pricing'});
$$('#upi button').forEach(b=>b.addEventListener('click',()=>{$$('#upi button').forEach(x=>{x.classList.remove('paid');x.textContent=x.dataset.n||x.textContent});b.dataset.n=b.dataset.n||b.textContent;b.classList.add('paid');b.textContent='✓ Subscribed with '+b.dataset.n}));

/* ---------- SuperMoney OKR ---------- */
const KR=[
 {o:1,n:'New users registered',t:25000,max:35000,step:500,fmt:v=>v.toLocaleString('en-IN')},
 {o:1,n:'Monthly active users',t:20000,max:30000,step:500,fmt:v=>v.toLocaleString('en-IN')},
 {o:1,n:'Avg. daily transactions',t:50000,max:70000,step:1000,fmt:v=>v.toLocaleString('en-IN')},
 {o:2,n:'Brand and retail partnerships',t:10,max:15,step:1,fmt:v=>v},
 {o:2,n:'#SuperMoneyCashback posts',t:1000,max:1500,step:50,fmt:v=>v.toLocaleString('en-IN')},
 {o:2,n:'App store rating',t:4.5,max:5,step:.1,fmt:v=>(+v).toFixed(1)+'★'}];
const SCN={doc:[20000,16500,41000,8,1200,4.2],slow:[11000,7500,19000,4,380,3.9],win:[27500,21000,56000,11,1350,4.6]};
function grade(p){return p>=100?['g','Green']:p>=75?['y','Yellow']:p>=50?['o','Orange']:['r','Red']}
KR.forEach((k,i)=>{const row=document.createElement('div');row.className='kr';
 row.innerHTML=`<label for="kr${i}">${k.n}<small><span id="kv${i}"></span> of ${k.fmt(k.t)} target · <span id="kp${i}"></span></small></label><span class="score" id="ks${i}"><i></i></span><input type="range" id="kr${i}" min="0" max="${k.max}" step="${k.step}">`;
 $('#o'+k.o).appendChild(row);$('#kr'+i).addEventListener('input',calc)});
function calc(){let tot=0;KR.forEach((k,i)=>{const v=+$('#kr'+i).value,p=Math.round(v/k.t*100),g=grade(p);tot+=Math.min(p,120);
 $('#kv'+i).textContent=k.fmt(v);$('#kp'+i).textContent=p+'%';const s=$('#ks'+i);s.className='score '+g[0];s.innerHTML='<i></i>'+g[1]});
 const avg=Math.round(tot/KR.length),g=grade(avg),d=$('#donut');d.style.setProperty('--p',Math.min(avg,100));d.dataset.v=avg+'%';
 d.style.setProperty('--hc',`var(--${{g:'good',y:'warn',o:'orange',r:'bad'}[g[0]]})`);const o=$('#overall');o.className='score '+g[0];o.innerHTML='<i></i>'+g[1]}
function loadScn(s){SCN[s].forEach((v,i)=>$('#kr'+i).value=v);calc();$$('[data-scn]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.scn===s))}
$$('[data-scn]').forEach(b=>b.addEventListener('click',()=>loadScn(b.dataset.scn)));loadScn('doc');

/* ---------- SuperCard ---------- */
$('#ccard').addEventListener('click',e=>e.currentTarget.classList.toggle('flip'));
const VS=[['Cashback online','5–10% at partner brands',['5% Amazon & Flipkart','2–5% select categories','5% on Amazon'],1],
 ['5% cashback on UPI','Yes',['No','No','No'],1],['Annual fee','None, lifetime free',['Yes','Yes','Yes'],1],['Hidden fees','None',['Yes','Yes','Yes'],1],
 ['Approval','Built for 100% approval',['Standard checks','Standard checks','Standard checks'],1],['Rewards','Cashback, vouchers',['Points','Reward points','Amazon Pay balance'],0],
 ['Application','Quick, online',['Lengthy','Lengthy','Simple, online'],[1,1,0]],['Interest-free period','45 days',['50 days','50 days','48 days'],0]];
function renderVS(){const r=+$('#rival').value;$('#vsTable').innerHTML='<tr><th></th><td class="us">SuperCard</td><td><b>'+$('#rival').selectedOptions[0].text+'</b></td></tr>'+VS.map(x=>{const win=Array.isArray(x[3])?x[3][r]:x[3];return `<tr class="${win?'win':''}"><th>${x[0]}</th><td class="us">${x[1]}</td><td>${x[2][r]}</td></tr>`}).join('')}
$('#rival').addEventListener('change',renderVS);renderVS();

/* ---------- JioCinema ---------- */
const JB=[{ic:'▶',t:'now',h:'JioCinema',b:'Watch live matches of #ParisOlympics2024 now on JioCinema!',w:'Generic. No sport, no athlete, no reason to open the app right now. It reads like it was sent to everyone, because it was.',bad:true}];
const JA=[
 {t:'21:40',h:'Neeraj is up in 15 minutes 🇮🇳',b:'Javelin final, streaming live and free. Don\'t hear about it in the group chat first.',w:'Urgency and social stakes. A named athlete, a countdown and the fear of missing a shared national moment.'},
 {t:'18:05',h:'You watched every rally last week 🏸',b:'Lakshya Sen\'s semi-final is next. Pick up right where you left off.',w:'Personalised from viewing history. It rewards the viewer\'s own behaviour instead of broadcasting a schedule.'},
 {t:'13:00',h:'Manu Bhaker goes for medal no. 2',b:'She\'s already made history once in Paris. Watch her shot at a second, live.',w:'Story-led. Builds on a medal people already celebrated, so it reads like the next chapter.'},
 {t:'Yesterday',h:'Missed the hockey bronze? 🥉',b:'Relive India\'s winning moments in 90 seconds.',w:'Recovers the miss. Viewers who skipped the live game still get a reason to tap, via a short highlight.'}];
function renderJio(set){$$('[data-jio]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.jio===set));const N=$('#jioN');N.innerHTML='';
 const list=set==='before'?JB:JA;$('#jioTime').textContent=set==='before'?'21:40':'21:41';
 list.forEach((n,i)=>{const b=document.createElement('button');b.className='ntf';b.style.animationDelay=(i*.12)+'s';
  b.innerHTML=`<span class="appic" style="background:var(--jio);color:#fff">▶</span><span class="hd"><span>JIOCINEMA</span><span>${n.t}</span></span><span class="bd"><b>${n.h}</b>${n.b}</span>`;
  b.addEventListener('click',()=>{$$('#jioN .ntf').forEach(x=>x.classList.toggle('sel',x===b));annot(n)});N.appendChild(b)});
 annot(list[0]);$$('#jioN .ntf')[0].classList.add('sel')}
function annot(n){const a=$('#jioA');a.className='annot'+(n.bad?' meh':'');a.innerHTML=`<small>${n.bad?'Why it fell flat':'Why it works'}</small>${n.w}`}
$$('[data-jio]').forEach(b=>b.addEventListener('click',()=>renderJio(b.dataset.jio)));renderJio('before');

/* ---------- Airbnb ---------- */
$('#abTog').addEventListener('click',e=>{const on=e.currentTarget.getAttribute('aria-checked')!=='true';e.currentTarget.setAttribute('aria-checked',on);$('#abBrowser').classList.toggle('work',on)});


/* ---------- v2: Airbnb x ZNMD ---------- */
const ZN=[
 {d:'Day 1',who:'Kabir',c:'stays',where:'Homes in Costa Brava',when:'3–4 Jun · 3 guests',clock:'12:48',g:'linear-gradient(160deg,#9ad0ec 0%,#5fb0d9 45%,#e9e2d0 46%,#d9cfb6 100%)',tag:'Guest favourite',t:'Home in Santa Cristina d\'Aro, Spain',r:'★ 4.75 (4)',s:'Family vacation, private pool and views · 4 beds · 3 bedrooms',checks:['Sea-view villa','Modern interiors','Swimming pool','Work space','3 bedrooms'],host:['K','Kabir is shortlisting stays for the soon-to-be-married boy'],p:'$639',u:'night'},
 {d:'Day 2–3',who:'Laila',c:'svc',where:'Services in Costa Brava',when:'3–5 Jun · Training',clock:'12:50',g:'linear-gradient(180deg,#7fd3e6 0%,#1f8fb5 55%,#0b4f6c 100%)',tag:'Services · New',t:'Discovering Scuba Diving in Tossa',r:'★ 5.0 (40)',s:'A sea christening with a PADI diving instructor. Discover the bottom of the bay.',checks:['PADI instructor','14 yrs diving experience'],host:['L','Hosted by Laila, scuba instructor and biker'],p:'$67',u:'guest'},
 {d:'Day 4–5',who:'All three',c:'exp',where:'Experiences near Valencia',when:'Day 4–5 · 3 guests',clock:'09:12',g:'radial-gradient(circle at 30% 40%,#ff6b4a 0 18%,transparent 19%),radial-gradient(circle at 70% 60%,#e8452c 0 22%,transparent 23%),linear-gradient(135deg,#d93a1e,#a8200e)',tag:'Detour',t:'La Tomatina, Buñol',r:'',s:'A detour for the tomato festival. All credit to Laila for tagging the boys along.',checks:['Unplanned detour','Laila\'s idea'],host:['L','Recommended by Laila'],p:'Free',u:'detour'},
 {d:'Day 6–8',who:'Arjun',c:'exp',where:'Experiences in Seville',when:'9–11 Jun · 3 guests',clock:'19:05',g:'radial-gradient(circle at 50% 30%,#ffb347,#c0392b 50%,#2c0f1e)',tag:'Original',t:'Enjoy an intimate flamenco show with a local',r:'★ 4.84 (1,052)',s:'The passion and artistry of flamenco in an iconic Seville neighbourhood. Moshi moshi! Arjun plans the trip ahead.',checks:['Flamenco artist &amp; storyteller','Cultural tour'],host:['A','Arjun found a great deal on Experiences'],p:'₹2,429',u:'guest'},
 {d:'Day 9–10',who:'Imraan',c:'exp',where:'Experiences in Spain',when:'12–15 Jun · Galleries',clock:'16:20',g:'linear-gradient(135deg,#f4efe6 0 30%,#d9cbb3 30% 34%,#f4efe6 34% 62%,#b98f63 62% 66%,#efe7da 66%)',tag:'9 experiences',t:'Step into El Raval\'s art scene with a gallerist',r:'',s:'Imraan, aka Majnu, hunts art galleries and studios for experiences to have for a lifetime.',checks:['Hidden galleries','Artist studio','Gallery owner'],host:['I','Imraan saved 3 art experiences'],p:'3',u:'experiences saved'}];
const WK=['Ideation, scripting and licensing.','Production: film, assets and UGC prep.','Teasers and a countdown.','Launch and the media push.','Retargeting and performance optimisation.'];
let zi=0;const booked=new Set();const znD=$('#znDays');
ZN.forEach((z,i)=>{const b=document.createElement('button');b.textContent=z.d+' · '+z.who;b.setAttribute('aria-pressed',i===0);b.addEventListener('click',()=>showZ(i));znD.appendChild(b)});
function showZ(i){zi=i;const z=ZN[i];$$('#znDays button').forEach((b,j)=>{b.setAttribute('aria-pressed',j===i);b.classList.toggle('booked',booked.has(j))});
 $('#znWhere').textContent=z.where;$('#znWhen').textContent=z.when;$('#znClock').textContent=z.clock;
 $$('#znCats span').forEach(s=>s.classList.toggle('on',s.dataset.c===z.c));
 $('#znBody').innerHTML=`<div class="hero" style="background:${z.g}"><span class="tag">${z.tag}</span><span class="heart">♡</span><span class="day">${z.d} · ${z.who}</span></div><h6>${z.t}<span>${z.r}</span></h6><p class="sub">${z.s}</p><div class="checks">${z.checks.map(c=>`<span>${c}</span>`).join('')}</div><div class="host"><i>${z.host[0]}</i>${z.host[1]}</div>`;
 $('#znPrice').textContent=z.p;$('#znUnit').textContent=z.u;const r=$('#znReserve');r.textContent=booked.has(i)?'Booked ✓':'Reserve';r.classList.toggle('done',booked.has(i))}
$('#znReserve').addEventListener('click',()=>{booked.add(zi);showZ(zi);
 if(booked.size===ZN.length){setTimeout(()=>$('#znEnd').classList.add('show'),400)}else{const n=[...ZN.keys()].find(j=>!booked.has(j));setTimeout(()=>showZ(n),reduce?0:600)}});
$('#znAgain').addEventListener('click',()=>{booked.clear();$('#znEnd').classList.remove('show');showZ(0)});
$$('#znWk button').forEach(b=>b.addEventListener('click',()=>{$$('#znWk button').forEach(x=>x.setAttribute('aria-pressed',x===b));$('#znWkNote').textContent=WK[+b.dataset.w]}));
$('#znWkNote').textContent=WK[0];showZ(0);

/* ---------- v2: Sarvam ---------- */
const LANGS=[['Hindi','हिन्दी','शुभ दीपावली!'],['Bengali','বাংলা','শুভ দীপাবলি!'],['Tamil','தமிழ்','தீபாவளி நல்வாழ்த்துகள்!'],['Telugu','తెలుగు','దీపావళి శుభాకాంక్షలు!'],['Kannada','ಕನ್ನಡ','ದೀಪಾವಳಿ ಹಬ್ಬದ ಶುಭಾಶಯಗಳು!'],['Malayalam','മലയാളം','ദീപാവലി ആശംസകൾ!'],['Marathi','मराठी','दिवाळीच्या हार्दिक शुभेच्छा!'],['Gujarati','ગુજરાતી','દિવાળીની શુભકામનાઓ!'],['Punjabi','ਪੰਜਾਬੀ','ਦੀਵਾਲੀ ਦੀਆਂ ਮੁਬਾਰਕਾਂ!'],['Odia','ଓଡ଼ିଆ','ଦୀପାବଳିର ଶୁଭେଚ୍ଛା!'],['English','English','Happy Diwali!']];
const SCR=[
 [['a','This is Diya from the ShopKart Diwali sale desk. Your order of brass diyas is running a day late. It will reach you by Thursday, 6 PM.'],['u','Okay. Can I still return it after Diwali?'],['a','Yes, returns stay open for 10 days. I\'ve sent the details on WhatsApp.']],
 [['a','Your cart still has the 3-piece cookware set. The Diwali price ends tonight at midnight.'],['u','Is there an extra discount on UPI?'],['a','Yes, ₹200 off on UPI. I\'ve texted you the checkout link.']],
 [['a','You asked about Diwali gift hampers. How many do you need, and by which date?'],['u','Around 150 for our office, by the 28th.'],['a','Got it. I\'ve booked a call with our corporate team for tomorrow at 11 AM.']]];
let su=0,sl=0,sTimers=[];const wv=$('#svWave');for(let i=0;i<34;i++){const x=document.createElement('i');x.style.animationDelay=(Math.random()).toFixed(2)+'s';wv.appendChild(x)}
LANGS.forEach((l,i)=>{const b=document.createElement('button');b.textContent=l[1];b.title=l[0];b.setAttribute('aria-pressed',i===0);b.addEventListener('click',()=>{sl=i;$$('#svLang button').forEach((x,j)=>x.setAttribute('aria-pressed',j===i));$('#svNote').textContent='Places a sample call in '+l[0]});$('#svLang').appendChild(b)});
$$('#svUC button').forEach(b=>b.addEventListener('click',()=>{su=+b.dataset.u;$$('#svUC button').forEach(x=>x.setAttribute('aria-pressed',x===b))}));
$('#svGo').addEventListener('click',()=>{sTimers.forEach(clearTimeout);sTimers=[];const tx=$('#svTx');tx.innerHTML='';const L=LANGS[sl];
 $('#svStatus').textContent='Outbound call · speaking '+L[0];$('#svLive').hidden=false;wv.classList.remove('idle');
 const lines=[['a',`<span class="native">${L[2]}</span>`],...SCR[su]];
 lines.forEach((ln,i)=>{const p=document.createElement('p');p.className=ln[0];p.innerHTML=`<b>${ln[0]==='a'?'Agent':'Customer'}:</b> ${ln[1]}`;tx.appendChild(p);sTimers.push(setTimeout(()=>p.classList.add('in'),reduce?0:300+i*1300))});
 sTimers.push(setTimeout(()=>{wv.classList.add('idle');$('#svLive').hidden=true;$('#svStatus').textContent='Call resolved · '+(su===2?'lead qualified':'no agent needed')},reduce?0:300+lines.length*1300+400))});
let sec=86399;setInterval(()=>{sec=sec>0?sec-1:86399;const h=String(Math.floor(sec/3600)).padStart(2,'0'),m=String(Math.floor(sec%3600/60)).padStart(2,'0'),s=String(sec%60).padStart(2,'0');$('#svClock').textContent='Live in '+h+':'+m+':'+s},1000);
let tk=0;setInterval(()=>{tk=(tk+1)%LANGS.length;$('#svTick').textContent=LANGS[tk][2]},reduce?4000:1600);

/* ---------- v2: Spotify ads ---------- */
$$('[data-sa]').forEach(b=>b.addEventListener('click',()=>{$$('[data-sa]').forEach(x=>x.setAttribute('aria-pressed',x===b));$$('[data-sa-panel]').forEach(p=>p.hidden=p.dataset.saPanel!==b.dataset.sa)}));
let q1=490279,q2=965053;const fmt=n=>n.toLocaleString('en-IN');
setInterval(()=>{q1+=Math.floor(Math.random()*40)+5;q2+=Math.floor(Math.random()*80)+10;$('#q1').textContent=fmt(q1);$('#q2').textContent=fmt(q2)},reduce?3000:900);
$('#qJoin').addEventListener('click',()=>{q1+=12000;q2+=25000;$('#q1').textContent=fmt(q1);$('#q2').textContent=fmt(q2);$('#qJoin').textContent='Still waiting…'});
function homejam(){const m=$('#miniP');const on=m.classList.toggle('playing');$('#miniPlay').textContent=on?'❚❚':'▶';$('#qTap').textContent=on?'Playing HomeJam ♫':'Tap for HomeJam'}
$('#miniPlay').addEventListener('click',homejam);$('#qTap').addEventListener('click',homejam);


// open a mock from an in-page link such as #znmd, even when that hash is already in the address bar
const jump=k=>{if(!tabs.some(t=>t.dataset.key===k))return false;openTab(k);$('#lab').scrollIntoView({behavior:reduce?'auto':'smooth'});return true};
document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(a&&jump(a.getAttribute('href').slice(1))){e.preventDefault();history.replaceState(null,'',a.getAttribute('href'))}});
addEventListener('hashchange',()=>jump(location.hash.slice(1)));
})();
