/* Варденяшка 7.0 — Древний город от первого лица. Чистая 2D Canvas-графика, без WebGL и 3D-моделей. */
(() => {
  'use strict';
  const STYLE_ID='city70-style';
  if(document.getElementById(STYLE_ID))document.getElementById(STYLE_ID).remove();
  const style=document.createElement('style');style.id=STYLE_ID;
  style.textContent=`
    #v5out .city70-wrap{width:100%;max-width:760px;margin:8px auto;color:#e5faff}
    #v5out .city70-hud{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin:8px 0}
    #v5out .city70-stat{min-width:0;padding:8px 6px;border:1px solid #35616a;border-radius:9px;background:linear-gradient(145deg,#14333d,#091b25);font-size:12px;line-height:1.35;text-align:center}
    #v5out .city70-stat b{display:block;color:#bafaff;font-size:15px;margin-top:2px}
    #v5out .city70-view{position:relative;width:100%;height:clamp(270px,48vh,430px);min-height:270px;overflow:hidden;border:3px solid #456c70;border-radius:12px;background:#07151d;box-shadow:inset 0 0 24px #000b,0 7px 18px #0008;touch-action:none}
    #v5out .city70-canvas{display:block;width:100%;height:100%;image-rendering:pixelated;touch-action:none}
    #v5out .city70-view-label{position:absolute;top:8px;left:9px;padding:5px 8px;border-radius:6px;background:#07151dcc;color:#c7faff;font-size:11px;pointer-events:none}
    #v5out .city70-map{display:none;margin:8px auto;padding:8px;border:1px solid #3d6970;border-radius:9px;background:#081b24;max-width:360px}
    #v5out .city70-map.open{display:block}
    #v5out .city70-map-grid{display:grid;gap:2px;margin-top:6px}
    #v5out .city70-map-cell{aspect-ratio:1;min-width:0;border-radius:2px;background:#345052}
    #v5out .city70-map-cell.wall{background:#0c2027}
    #v5out .city70-map-cell.hero{background:#48d9e6;box-shadow:0 0 7px #72faff}
    #v5out .city70-map-cell.relic{background:#b6ffff}
    #v5out .city70-map-cell.warden{background:#e7ffff;box-shadow:0 0 8px #b5ffff}
    #v5out .city70-log{min-height:42px;margin:8px 0;padding:10px 11px;border:1px solid #315e68;border-radius:9px;background:#0a202a;color:#e1f9f5;font-size:13px;line-height:1.45}
    #v5out .city70-controls{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;max-width:410px;margin:10px auto}
    #v5out .city70-controls button{min-width:0;min-height:54px;padding:8px 4px;border-radius:11px;font-size:15px;font-weight:800;touch-action:manipulation;user-select:none;-webkit-user-select:none}
    #v5out .city70-controls .empty{visibility:hidden}
    #v5out .city70-actions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin:8px 0}
    #v5out .city70-actions button{min-width:0;min-height:46px;padding:7px 4px;font-size:12px;line-height:1.25}
    #v5out .city70-help{margin:8px 0;color:#b7dce2;font-size:12px;line-height:1.5}
    @media(max-width:390px){#v5out .city70-hud{gap:4px}#v5out .city70-stat{padding:6px 3px;font-size:11px}#v5out .city70-stat b{font-size:13px}#v5out .city70-view{height:clamp(270px,44vh,360px)}#v5out .city70-controls button{min-height:58px;font-size:14px}#v5out .city70-actions{gap:5px}#v5out .city70-actions button{font-size:11px}}
    @media(orientation:landscape) and (max-height:520px){#v5out .city70-view{height:58vh;min-height:210px}#v5out .city70-controls{max-width:560px;grid-template-columns:repeat(5,minmax(0,1fr))}#v5out .city70-controls .empty{display:none}#v5out .city70-controls button{min-height:46px}}
  `;
  document.head.append(style);
  const STORE='warden_city_v62',baseStats={runs:0,wins:0,relics:0,chests:0};
  function readStats(){try{return {...baseStats,...(JSON.parse(localStorage.getItem(STORE)||'{}')||{})}}catch(_){return {...baseStats}}}
  function saveStats(s){try{localStorage.setItem(STORE,JSON.stringify(s))}catch(_){}}
  function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
  function distanceMap(map,start){const q=[start],dist=new Map([[start.x+','+start.y,0]]),dirs=[[0,-1],[1,0],[0,1],[-1,0]];for(let i=0;i<q.length;i++){const p=q[i],d=dist.get(p.x+','+p.y);for(const [dx,dy] of dirs){const x=p.x+dx,y=p.y+dy,k=x+','+y;if(map[y]&&map[y][x]===0&&!dist.has(k)){dist.set(k,d+1);q.push({x,y})}}}return dist}
  const DIRS=[[0,-1],[1,0],[0,1],[-1,0]],clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  window.startCity62=function({difficulty,makeMaze,field,out,rewardChallenge,ach,btn,challengeFail,changeCoins,clear}){
    clear();const token=window.__city70Token=(window.__city70Token||0)+1;
    const size=difficulty==='easy'?9:difficulty==='hard'?13:11,maxMoves=difficulty==='easy'?150:difficulty==='hard'?230:190,maxHealth=difficulty==='easy'?5:3,required=difficulty==='hard'?4:3;
    const map=makeMaze(size),start={x:1,y:1},portal={x:1,y:1},pos={x:1,y:1};let facing=DIRS.findIndex(([dx,dy])=>!!(map[start.y+dy]&&map[start.y+dy][start.x+dx]===0));if(facing<0)facing=1;
    const reachable=[];for(let y=1;y<size-1;y++)for(let x=1;x<size-1;x++)if(map[y][x]===0&&!(x===1&&y===1))reachable.push({x,y});shuffle(reachable);
    const relics=reachable.splice(0,required).map(p=>({...p,found:false})),chestCount=difficulty==='easy'?3:difficulty==='hard'?5:4,chests=reachable.splice(0,chestCount).map(p=>({...p,opened:false})),sensorCount=difficulty==='easy'?3:difficulty==='hard'?7:5,sensors=reachable.splice(0,sensorCount).map(p=>({...p,triggered:false})),woolCount=difficulty==='hard'?2:3,wool=reachable.splice(0,woolCount),wardenSpawn={...(reachable.pop()||{x:size-2,y:size-2})};let warden={...wardenSpawn};
    const stats=readStats();stats.runs++;saveStats(stats);let moves=0,health=maxHealth,lantern=difficulty==='hard'?2:3,noise=0,wardenAwake=false,wardenStun=0,wardenStep=0,done=false,crouching=false,mapOpen=false;
    const wrap=document.createElement('div');wrap.className='city70-wrap';out.append(wrap);
    const hudBox=document.createElement('div');hudBox.className='city70-hud';wrap.append(hudBox);
    const view=document.createElement('div');view.className='city70-view';wrap.append(view);
    const canvas=document.createElement('canvas');canvas.className='city70-canvas';canvas.setAttribute('aria-label','Пиксельный вид от первого лица: коридоры Древнего города');view.append(canvas);
    const ctx=canvas.getContext('2d');const label=document.createElement('div');label.className='city70-view-label';label.textContent='👁️ ВИД ОТ ПЕРВОГО ЛИЦА · 2D';view.append(label);
    const log=document.createElement('div');log.className='city70-log';log.setAttribute('aria-live','polite');log.textContent='🏛️ Ты вошёл в Древний город. Найди реликвии и вернись к порталу.';wrap.append(log);
    const controls=document.createElement('div');controls.className='city70-controls';wrap.append(controls);
    function control(text,aria,fn,cls){const b=document.createElement('button');b.type='button';b.textContent=text;b.setAttribute('aria-label',aria);if(cls)b.className=cls;b.addEventListener('click',fn);controls.append(b);return b}
    const blank=document.createElement('span');blank.className='empty';controls.append(blank);
    control('⬆️ Вперёд','Идти вперёд',()=>move(1));control('↻ Вправо','Повернуть направо',()=>turn(1));
    control('↶ Влево','Повернуть налево',()=>turn(-1));control('⬇️ Назад','Идти назад',()=>move(-1));
    const crouchBtn=control('🤫 Тихо: выкл','Включить тихий шаг',toggleCrouch);
    const actions=document.createElement('div');actions.className='city70-actions';wrap.append(actions);
    function actionButton(text,aria,fn){const b=document.createElement('button');b.type='button';b.textContent=text;b.setAttribute('aria-label',aria);b.addEventListener('click',fn);actions.append(b);return b}
    const lanternBtn=actionButton('🔦 Фонарь ×'+lantern,'Использовать душевный фонарь',useLantern),mapBtn=actionButton('🗺️ Карта','Показать карту города',toggleMap),diaryBtn=actionButton('📜 Дневник','Открыть дневник экспедиции',diary);
    const mapPanel=document.createElement('div');mapPanel.className='city70-map';wrap.append(mapPanel);
    const help=document.createElement('p');help.className='city70-help';help.textContent='Управление: кнопки на экране или свайпы по коридору. Вперёд/назад — движение, лево/право — поворот. На компьютере — WASD или стрелки. Включи тихий шаг, чтобы не поднимать шум.';wrap.append(help);
    field.hidden=true;let cssW=360,cssH=300,dpr=1;
    function resize(){const r=view.getBoundingClientRect();cssW=Math.max(280,Math.floor(r.width||360));cssH=Math.max(250,Math.floor(r.height||300));dpr=Math.min(2,Math.max(1,window.devicePixelRatio||1));canvas.width=Math.floor(cssW*dpr);canvas.height=Math.floor(cssH*dpr);canvas.style.width='100%';canvas.style.height='100%';if(ctx){ctx.setTransform(dpr,0,0,dpr,0,0);ctx.imageSmoothingEnabled=false;drawScene()}}
    function poly(points,fill,stroke){ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke()}}
    function wallTexture(x1,y1,x2,y2,seed,front){const w=Math.max(8,x2-x1),h=Math.max(8,y2-y1);ctx.fillStyle=front?'#172d31':'#13282d';ctx.fillRect(x1,y1,w,h);const rows=front?5:4,cols=front?6:4;for(let ry=0;ry<rows;ry++)for(let cx=0;cx<cols;cx++){const v=(seed*17+ry*13+cx*7)%5;ctx.fillStyle=['#203a3d','#294548','#1b3337','#355052','#243e41'][v];const bx=x1+cx*w/cols,by=y1+ry*h/rows;ctx.fillRect(bx+1,by+1,Math.max(1,w/cols-2),Math.max(1,h/rows-2));if((seed+ry+cx)%7===0){ctx.fillStyle='#376a68';ctx.fillRect(bx+w/cols*.45,by+h/rows*.55,Math.max(2,w/cols*.16),Math.max(2,h/rows*.16))}}}
    function drawObject(kind,x,y,scale){ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);if(kind==='relic'){poly([[-17,0],[0,-22],[17,0],[0,22]],'#8ffaff','#e2ffff');poly([[-8,0],[0,-13],[8,0],[0,13]],'#2f9ea9')}else if(kind==='chest'){ctx.fillStyle='#704522';ctx.fillRect(-19,-12,38,25);ctx.fillStyle='#b47a38';ctx.fillRect(-17,-10,34,10);ctx.fillStyle='#e9c77b';ctx.fillRect(-3,-7,6,13);ctx.fillStyle='#36251b';ctx.fillRect(-19,1,38,3)}else if(kind==='sensor'){ctx.fillStyle='#183e42';ctx.fillRect(-16,-10,32,20);ctx.fillStyle='#55e7ec';ctx.fillRect(-5,-5,10,10);ctx.fillStyle='#b6ffff';ctx.fillRect(-2,-2,4,4)}else if(kind==='warden'){ctx.fillStyle='#081113';ctx.fillRect(-15,-24,30,43);ctx.fillRect(-23,-17,8,29);ctx.fillRect(15,-17,8,29);ctx.fillRect(-12,17,9,12);ctx.fillRect(3,17,9,12);ctx.fillStyle='#73faff';ctx.fillRect(-10,-11,7,4);ctx.fillRect(4,-11,7,4);ctx.fillStyle='#25494a';ctx.fillRect(-7,-2,14,12)}else if(kind==='portal'){ctx.strokeStyle='#8ffaff';ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(0,0,16,25,0,0,Math.PI*2);ctx.stroke();ctx.strokeStyle='#367c83';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,0,9,18,0,0,Math.PI*2);ctx.stroke()}ctx.restore()}
    function same(a,b){return !!a&&a.x===b.x&&a.y===b.y}
    function cellObject(x,y){const p={x,y};if(wardenAwake&&same(warden,p))return 'warden';if(relics.some(r=>!r.found&&same(r,p)))return 'relic';if(chests.some(c=>!c.opened&&same(c,p)))return 'chest';if(sensors.some(s=>!s.triggered&&same(s,p)))return 'sensor';if(same(portal,p))return 'portal';return null}
    function drawScene(){
      if(!ctx||done)return;const w=cssW,h=cssH,cx=w/2,horizon=h*.37;
      const sky=ctx.createLinearGradient(0,0,0,horizon);sky.addColorStop(0,'#06121b');sky.addColorStop(1,'#172f35');ctx.fillStyle=sky;ctx.fillRect(0,0,w,horizon);
      const floor=ctx.createLinearGradient(0,horizon,0,h);floor.addColorStop(0,'#24383a');floor.addColorStop(1,'#081116');ctx.fillStyle=floor;ctx.fillRect(0,horizon,w,h-horizon);
      const ceiling=ctx.createLinearGradient(0,0,0,horizon);ceiling.addColorStop(0,'#07151a');ceiling.addColorStop(1,'#1a3437');poly([[0,0],[w,0],[cx+w*.08,horizon],[cx-w*.08,horizon]],ceiling);
      const f=DIRS[facing],left=[-f[1],f[0]],right=[f[1],-f[0]];
      const bounds=d=>{const half=w*(.36/(d+.55)),tall=h*(.53/(d+1.05));return {l:cx-half,r:cx+half,t:horizon-tall,b:horizon+tall}};
      for(let d=4;d>=1;d--){
        const p={x:pos.x+f[0]*d,y:pos.y+f[1]*d},near=bounds(d-1),far=bounds(d),lp={x:p.x+left[0],y:p.y+left[1]},rp={x:p.x+right[0],y:p.y+right[1]};
        poly([[near.l,near.b],[near.r,near.b],[far.r,far.b],[far.l,far.b]],d%2?'#1b3033':'#22383a','#30484a');
        ctx.strokeStyle='#40585a';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(near.l,near.b);ctx.lineTo(far.l,far.b);ctx.moveTo(near.r,near.b);ctx.lineTo(far.r,far.b);ctx.stroke();
        const leftOpen=!!(map[lp.y]&&map[lp.y][lp.x]===0),rightOpen=!!(map[rp.y]&&map[rp.y][rp.x]===0);
        poly([[near.l,near.t],[far.l,far.t],[far.l,far.b],[near.l,near.b]],leftOpen?'#10272b':'#20383b','#385456');
        poly([[near.r,near.t],[far.r,far.t],[far.r,far.b],[near.r,near.b]],rightOpen?'#10272b':'#20383b','#385456');
        // Side passages are dark doorways, so the player can recognise branches before turning.
        if(leftOpen)poly([[near.l+(near.r-near.l)*.08,near.t+(near.b-near.t)*.22],[far.l+(far.r-far.l)*.08,far.t+(far.b-far.t)*.22],[far.l+(far.r-far.l)*.08,far.b-(far.b-far.t)*.16],[near.l+(near.r-near.l)*.08,near.b-(near.b-near.t)*.16]],'#030d12','#315154');
        if(rightOpen)poly([[near.r-(near.r-near.l)*.08,near.t+(near.b-near.t)*.22],[far.r-(far.r-far.l)*.08,far.t+(far.b-far.t)*.22],[far.r-(far.r-far.l)*.08,far.b-(far.b-far.t)*.16],[near.r-(near.r-near.l)*.08,near.b-(near.b-near.t)*.16]],'#030d12','#315154');
        if(!map[p.y]||map[p.y][p.x]===1){wallTexture(far.l,far.t,far.r,far.b,d,true);break}
        const obj=cellObject(p.x,p.y);if(obj){const scale=clamp(.9/(d*.48),.16,.75);drawObject(obj,cx,far.b-(far.b-far.t)*.40,scale)}
        if(wool.some(v=>same(v,p))){ctx.fillStyle='#c5d9d0';ctx.fillRect(far.l+(far.r-far.l)*.3,far.b-4,Math.max(2,(far.r-far.l)*.4),3)}
      }
      if(noise>0){ctx.globalAlpha=Math.min(.3,noise*.035);ctx.fillStyle='#39c5c5';ctx.fillRect(0,horizon*.75,w,5);ctx.globalAlpha=1}
      if(wardenAwake&&wardenStun===0){ctx.fillStyle='#b7ffff';ctx.font='bold 12px system-ui';ctx.textAlign='center';ctx.fillText('СТРАЖ СЛЫШИТ ТЕБЯ',cx,h-12)}
      const vignette=ctx.createRadialGradient(cx,h*.52,w*.12,cx,h*.52,w*.78);vignette.addColorStop(0,'#0000');vignette.addColorStop(1,'#02090dbb');ctx.fillStyle=vignette;ctx.fillRect(0,0,w,h);
    }
    function updateHud(){
      const rows=[['❤️ Здоровье',health+'/'+maxHealth],['💎 Реликвии',relics.filter(r=>r.found).length+'/'+required],['👣 Шаги',moves+'/'+maxMoves],['🔊 Шум',noise+'/7'],['🔦 Фонарь',String(lantern)],['👁️ Страж',wardenStun>0?'Оглушён':wardenAwake?'Охотится':'Спит']];
      hudBox.replaceChildren(...rows.map(([name,value])=>{const el=document.createElement('div');el.className='city70-stat';const span=document.createElement('span');span.textContent=name;const b=document.createElement('b');b.textContent=value;el.append(span,b);return el}));
      lanternBtn.textContent='🔦 Фонарь ×'+lantern;lanternBtn.disabled=lantern<=0||!wardenAwake||wardenStun>0||done;crouchBtn.textContent=crouching?'🤫 Тихо: вкл':'🤫 Тихо: выкл';crouchBtn.setAttribute('aria-label',crouching?'Выключить тихий шаг':'Включить тихий шаг');mapBtn.textContent=mapOpen?'✖ Закрыть карту':'🗺️ Карта';
    }
    function setLog(t){log.textContent=t}
    function renderMap(){mapPanel.replaceChildren();const title=document.createElement('strong');title.textContent='🗺️ Карта исследованной области';mapPanel.append(title);const grid=document.createElement('div');grid.className='city70-map-grid';grid.style.gridTemplateColumns='repeat('+size+',minmax(0,1fr))';for(let y=0;y<size;y++)for(let x=0;x<size;x++){const el=document.createElement('span');el.className='city70-map-cell'+(map[y][x]?' wall':'');const p={x,y};if(same(pos,p))el.classList.add('hero');else if(wardenAwake&&same(warden,p))el.classList.add('warden');else if(relics.some(r=>!r.found&&same(r,p)))el.classList.add('relic');grid.append(el)}mapPanel.append(grid);const legend=document.createElement('p');legend.className='city70-help';legend.textContent='Голубой — ты · белый — Страж · светлый — реликвия · тёмный — стена.';mapPanel.append(legend)}
    function toggleMap(){mapOpen=!mapOpen;mapPanel.classList.toggle('open',mapOpen);if(mapOpen)renderMap();drawScene();updateHud()}
    function diary(){setLog('📜 Экспедиция №'+stats.runs+' · Сложность: '+difficulty+' · Реликвии: '+relics.filter(r=>r.found).length+'/'+required+' · Сундуки: '+chests.filter(c=>c.opened).length+'/'+chestCount+' · Шаги: '+moves+' · Шум: '+noise+'/7 · Страж: '+(wardenAwake?'проснулся':'спит'))}
    let keyHandler=null;
    function finish(won,reason){
      if(done)return;done=true;window.__city70Token++;if(won){stats.wins++;saveStats(stats);rewardChallenge(34+Math.max(0,maxMoves-moves)*.18,'Древний город исследован! Ты вернулся с реликвиями.');ach('Повелитель Древнего города');ach('Тихий исследователь')}
      if(keyHandler)document.removeEventListener('keydown',keyHandler);wrap.replaceChildren();
      const title=document.createElement('h3');title.textContent=won?'🏆 Экспедиция завершена!':'💔 Экспедиция окончена';wrap.append(title);
      const summary=document.createElement('p');summary.textContent=reason+' · Реликвии: '+relics.filter(r=>r.found).length+'/'+required+' · Сундуки: '+chests.filter(c=>c.opened).length+'/'+chestCount+' · Шаги: '+moves;wrap.append(summary);
      const record=document.createElement('p');record.className='city70-help';record.textContent='📜 Экспедиций: '+stats.runs+' · Побед: '+stats.wins+' · Найдено реликвий: '+stats.relics+' · Открыто сундуков: '+stats.chests;wrap.append(record);
      btn('🏛️ Новая экспедиция',()=>window.city70Restart&&window.city70Restart());btn('↩️ В приключения',()=>{const b=document.querySelector('[data-v5="city"]');if(b)b.click()});
    }
    function wardenMove(){if(!wardenAwake||wardenStun>0)return;const distances=distanceMap(map,pos);let best=null,bestD=Infinity;for(const [dx,dy] of DIRS){const p={x:warden.x+dx,y:warden.y+dy};if(!map[p.y]||map[p.y][p.x]!==0)continue;const d=distances.get(p.x+','+p.y);if(d!==undefined&&d<bestD){bestD=d;best=p}}if(best)warden=best;if(same(warden,pos)){health--;warden={...wardenSpawn};wardenStun=2;setLog('💥 Страж настиг тебя! Потеряно ❤️. Он отступил в тень. Используй фонарь или тихий шаг.');if(health<=0){finish(false,'Страж забрал все силы.');return}}}
    function enterCell(){
      const relic=relics.find(r=>!r.found&&same(r,pos));if(relic){relic.found=true;stats.relics++;saveStats(stats);setLog('✨ Найдена древняя реликвия! '+relics.filter(r=>r.found).length+'/'+required)}
      const chest=chests.find(c=>!c.opened&&same(c,pos));if(chest){chest.opened=true;stats.chests++;saveStats(stats);const gems=6+Math.floor(Math.random()*7);changeCoins(gems);lantern++;setLog('📦 Сундук открыт! +'+gems+' 💎 и +1 заряд душевного фонаря.')}
      const sensor=sensors.find(s=>!s.triggered&&same(s,pos));if(sensor){sensor.triggered=true;noise=Math.min(7,noise+3);setLog('🔊 Скалк-сенсор сработал! Шум резко вырос.')}
      if(noise>=7&&!wardenAwake){wardenAwake=true;setLog('👁️ СТРАЖ ПРОСНУЛСЯ! Используй фонарь и тихий шаг.')}
      if(relics.every(r=>r.found)&&same(pos,portal)){finish(true,'Ты вернулся к порталу с древними реликвиями!');return}
    }
    function step(dx,dy){if(done||token!==window.__city70Token)return false;const nx=pos.x+dx,ny=pos.y+dy;if(!map[ny]||map[ny][nx]!==0){setLog('🪨 Впереди древняя стена. Поищи другой проход.');return false}pos.x=nx;pos.y=ny;moves++;const quiet=crouching||wool.some(w=>same(w,pos));if(!quiet)noise=Math.min(7,noise+1);enterCell();if(done)return true;if(wardenStun>0)wardenStun--;else if(wardenAwake){wardenStep++;if(wardenStep%2===0)wardenMove()}if(done)return true;if(moves>=maxMoves){finish(false,'Закончились шаги.');return true}updateHud();drawScene();if(mapOpen)renderMap();return true}
    function move(direction){const sign=direction===1?1:-1,f=DIRS[facing];step(f[0]*sign,f[1]*sign)}
    function turn(delta){if(done)return;facing=(facing+delta+4)%4;updateHud();drawScene()}
    function toggleCrouch(){if(done)return;crouching=!crouching;setLog(crouching?'🤫 Ты крадёшься. Шаги не повышают шум.':'👣 Ты снова идёшь обычным шагом.');updateHud()}
    function useLantern(){if(done||!wardenAwake||wardenStun>0||lantern<=0)return;lantern--;wardenStun=4;noise=Math.max(0,noise-2);setLog('🔦 Душевный фонарь ослепил Стража на 4 хода!');updateHud();drawScene()}
    function keyAction(e){if(done||token!==window.__city70Token||e.altKey||e.ctrlKey||e.metaKey||e.repeat)return;const k=e.code;if(k==='ArrowUp'||k==='KeyW'){e.preventDefault();move(1)}else if(k==='ArrowDown'||k==='KeyS'){e.preventDefault();move(-1)}else if(k==='ArrowLeft'||k==='KeyA'){e.preventDefault();turn(-1)}else if(k==='ArrowRight'||k==='KeyD'){e.preventDefault();turn(1)}else if(k==='Space'){e.preventDefault();toggleCrouch()}}
    keyHandler=keyAction;document.addEventListener('keydown',keyHandler);
    let touchStart=null;canvas.addEventListener('pointerdown',e=>{touchStart={x:e.clientX,y:e.clientY};if(canvas.setPointerCapture)canvas.setPointerCapture(e.pointerId)});
    canvas.addEventListener('pointerup',e=>{if(!touchStart||done)return;const dx=e.clientX-touchStart.x,dy=e.clientY-touchStart.y;touchStart=null;if(Math.max(Math.abs(dx),Math.abs(dy))<24)return;if(Math.abs(dx)>Math.abs(dy))turn(dx>0?1:-1);else move(dy<0?1:-1)});
    canvas.addEventListener('pointercancel',()=>{touchStart=null});
    function onResize(){resize()}
    window.addEventListener('resize',onResize);window.city70Restart=()=>{if(keyHandler)document.removeEventListener('keydown',keyHandler);window.removeEventListener('resize',onResize);const b=document.querySelector('[data-v5="city"]');if(b)b.click()};
    if(window.visualViewport)window.visualViewport.addEventListener('resize',onResize);
    resize();updateHud();drawScene();
  };
})();