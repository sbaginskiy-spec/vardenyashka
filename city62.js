/* Варденяшка 6.2 — расширенный Древний город: туман войны, скалк-сенсоры, Страж, сундуки и душевный фонарь. */
(() => {
  'use strict';
  const STYLE = document.createElement('style');
  STYLE.id = 'city62-style';
  STYLE.textContent = `
    #v5field.city62-grid[hidden]{display:none!important}
    #v5field.city62-grid{display:grid!important;grid-template-columns:repeat(var(--city-size),minmax(0,1fr))!important;gap:3px!important;padding:7px!important;max-width:650px;margin:10px auto!important;background:linear-gradient(145deg,#07151d,#102b32 55%,#07131b)!important;border:3px solid #456b70!important;border-radius:12px!important;box-shadow:inset 0 0 28px #000b,0 8px 20px #0008!important;touch-action:none!important}
    #v5field.city62-grid .city62-tile{aspect-ratio:1;min-width:0;display:grid;place-items:center;padding:0!important;border:1px solid #29454a!important;border-radius:3px!important;background:repeating-linear-gradient(135deg,#35494a 0 5px,#263a3c 5px 10px)!important;color:#e9ffff;font-size:clamp(11px,3.2vw,24px);font-weight:900;text-shadow:0 2px 4px #000;box-shadow:inset 2px 2px #ffffff12,inset -3px -3px #0008!important;overflow:hidden}
    #v5field.city62-grid .city62-tile.wall{background:repeating-linear-gradient(45deg,#15282b 0 5px,#20373a 5px 10px)!important;border-color:#304c50!important}
    #v5field.city62-grid .city62-tile.fog{background:#050d13!important;border-color:#0a171c!important;color:transparent!important;filter:none!important}
    #v5field.city62-grid .city62-tile.hero{background:linear-gradient(145deg,#226b78,#16404f)!important;border:2px solid #a4f4e9!important;box-shadow:0 0 12px #65f2df88!important}
    #v5field.city62-grid .city62-tile.portal{background:radial-gradient(circle,#8cf4ed 0 15%,#236f76 18% 38%,#182e3c 42%)!important;border-color:#8df7e8!important}
    #v5field.city62-grid .city62-tile.relic{background:radial-gradient(circle,#a8fbff 0 12%,#247f8a 18%,#263d46 65%)!important;border-color:#8cf5f2!important}
    #v5field.city62-grid .city62-tile.chest{background:repeating-linear-gradient(90deg,#79502b 0 6px,#a8753e 6px 12px)!important;border-color:#e9c17c!important}
    #v5field.city62-grid .city62-tile.sensor{background:radial-gradient(circle,#64e7ec 0 10%,#31585b 15%,#1c3035 70%)!important;border-color:#70c7c7!important}
    #v5field.city62-grid .city62-tile.wool{background:repeating-linear-gradient(45deg,#d8e7df 0 5px,#a9c8c1 5px 10px)!important;color:#173a3c!important;text-shadow:none!important;border-color:#effff8!important}
    #v5field.city62-grid .city62-tile.warden{background:radial-gradient(circle,#111 0 25%,#345a5a 30% 65%,#132326 70%)!important;border-color:#b7ffff!important;box-shadow:0 0 14px #8fffff99!important}
    .city62-hud{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;margin:8px 0}
    .city62-stat{background:linear-gradient(145deg,#102d38,#091c27);border:1px solid #3c737b;border-radius:9px;padding:8px 10px;color:#d9faff;font-size:12px;font-weight:700}
    .city62-stat b{color:#fff;font-size:14px}
    .city62-controls{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin:9px 0}
    .city62-controls button{min-height:44px;font-size:18px}
    .city62-controls .city62-empty{visibility:hidden}
    .city62-actions{display:flex;flex-wrap:wrap;gap:7px;margin:8px 0}
    .city62-actions button{flex:1 1 130px;min-height:43px}
    .city62-log{min-height:40px;padding:9px 11px;border-radius:9px;background:#0b202b;border:1px solid #315a65;color:#d4f5ef;font-size:13px;line-height:1.45}
    .city62-help{font-size:12px;color:#b8d8df;line-height:1.5;margin:7px 0}
    @media(max-width:390px){#v5field.city62-grid{gap:2px!important;padding:4px!important}.city62-stat{padding:6px;font-size:11px}}
  `;
  document.head.append(STYLE);

  function readStats(){
    try{return {...{runs:0,wins:0,relics:0,chests:0},...(JSON.parse(localStorage.getItem('warden_city_v62')||'{}')||{})}}
    catch(_){return {runs:0,wins:0,relics:0,chests:0}}
  }
  function saveStats(s){try{localStorage.setItem('warden_city_v62',JSON.stringify(s))}catch(_){}}
  function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
  function distanceMap(map,start){
    const q=[start],dist=new Map([[start.x+','+start.y,0]]),dirs=[[0,-1],[-1,0],[0,1],[1,0]];
    for(let i=0;i<q.length;i++){const p=q[i],d=dist.get(p.x+','+p.y);for(const [dx,dy] of dirs){const x=p.x+dx,y=p.y+dy,k=x+','+y;if(map[y]&&map[y][x]===0&&!dist.has(k)){dist.set(k,d+1);q.push({x,y})}}}
    return dist;
  }
  window.startCity62 = function({difficulty,makeMaze,field,out,rewardChallenge,ach,btn,challengeFail,changeCoins,clear}){
    clear();
    const token=window.__city62Token=(window.__city62Token||0)+1;
    const size=difficulty==='easy'?9:difficulty==='hard'?13:11;
    const maxMoves=difficulty==='easy'?130:difficulty==='hard'?205:165;
    const maxHealth=difficulty==='easy'?4:3;
    const lanternStart=difficulty==='hard'?2:3;
    const required= difficulty==='hard'?4:3;
    const map=makeMaze(size),start={x:1,y:1},portal={x:1,y:1},pos={...start};
    const reachable=[];
    for(let y=1;y<size-1;y++)for(let x=1;x<size-1;x++)if(map[y][x]===0&&!(x===start.x&&y===start.y))reachable.push({x,y});
    shuffle(reachable);
    const relics=reachable.splice(0,required).map(p=>({...p,found:false}));
    const chestCount=difficulty==='easy'?3:difficulty==='hard'?5:4;
    const chests=reachable.splice(0,chestCount).map(p=>({...p,opened:false}));
    const sensorCount=difficulty==='easy'?3:difficulty==='hard'?7:5;
    const sensors=reachable.splice(0,sensorCount).map(p=>({...p,triggered:false}));
    const woolCount=difficulty==='hard'?2:3;
    const wool=reachable.splice(0,woolCount);
    const stats=readStats();stats.runs++;saveStats(stats);
    let moves=0,health=maxHealth,lantern=lanternStart,noise=0,wardenAwake=false,wardenStun=0,wardenStep=0,done=false;
    const wardenSpawn=reachable[reachable.length-1]||{x:size-2,y:size-2};
    let warden={...wardenSpawn};
    const info=document.createElement('div');info.className='city62-hud';out.append(info);
    const log=document.createElement('div');log.className='city62-log';log.setAttribute('aria-live','polite');log.textContent='🏛️ Найди древние реликвии. Не шуми — скалк слышит каждый шаг.';out.append(log);
    const controls=document.createElement('div');controls.className='city62-controls';out.append(controls);
    const empty=()=>{const b=document.createElement('button');b.className='city62-empty';b.disabled=true;return b};
    controls.append(empty());
    const moveUp=document.createElement('button');moveUp.textContent='⬆️';moveUp.setAttribute('aria-label','Идти вверх');controls.append(moveUp);
    controls.append(empty());
    const moveLeft=document.createElement('button');moveLeft.textContent='⬅️';moveLeft.setAttribute('aria-label','Идти влево');controls.append(moveLeft);
    const moveDown=document.createElement('button');moveDown.textContent='⬇️';moveDown.setAttribute('aria-label','Идти вниз');controls.append(moveDown);
    const moveRight=document.createElement('button');moveRight.textContent='➡️';moveRight.setAttribute('aria-label','Идти вправо');controls.append(moveRight);
    const actions=document.createElement('div');actions.className='city62-actions';out.append(actions);
    const lanternBtn=document.createElement('button');lanternBtn.type='button';actions.append(lanternBtn);
    const statsBtn=document.createElement('button');statsBtn.type='button';statsBtn.textContent='📜 Дневник экспедиции';actions.append(statsBtn);
    const help=document.createElement('p');help.className='city62-help';help.textContent='Управление: стрелки, WASD или свайп. Собери реликвии и вернись к порталу ⌂. Синие сенсоры повышают шум; белая шерсть заглушает шаги. Душевный фонарь на время отпугивает Стража.';out.append(help);
    field.hidden=false;field.className='city62-grid';field.style.setProperty('--city-size',String(size));field.setAttribute('aria-label','Древний город '+size+' на '+size);
    const tiles=[];
    for(let i=0;i<size*size;i++){const tile=document.createElement('div');tile.className='city62-tile';field.append(tile);tiles.push(tile)}
    const directions=[[0,-1],[-1,0],[0,1],[1,0]];
    function isAt(a,b){return !!a&&a.x===b.x&&a.y===b.y}
    function setLog(t){log.textContent=t}
    function hud(){
      const statsData=[
        ['❤️ Здоровье','<b>'+health+'/'+maxHealth+'</b>'],
        ['💎 Реликвии','<b>'+relics.filter(r=>r.found).length+'/'+required+'</b>'],
        ['👣 Шаги','<b>'+moves+'/'+maxMoves+'</b>'],
        ['🔊 Шум','<b>'+noise+'/7</b>'],
        ['🔦 Душевный фонарь','<b>'+lantern+'</b>'],
        ['👁️ Страж','<b>'+(wardenStun>0?'Оглушён':wardenAwake?'Охотится':'Спит')+'</b>']
      ];
      info.replaceChildren(...statsData.map(([name,value])=>{const el=document.createElement('div');el.className='city62-stat';el.innerHTML=name+': '+value;return el}));
      lanternBtn.textContent='🔦 Использовать фонарь ×'+lantern;
      lanternBtn.disabled=lantern<=0||!wardenAwake||wardenStun>0||done;
    }
    function render(){
      if(done||token!==window.__city62Token)return;
      const visible=(x,y)=>Math.abs(pos.x-x)+Math.abs(pos.y-y)<=2;
      tiles.forEach((tile,i)=>{
        const x=i%size,y=Math.floor(i/size),p={x,y},hero=isAt(pos,p),isVisible=visible(x,y);
        tile.className='city62-tile'+(map[y][x]?' wall':'')+(!isVisible?' fog':'');
        if(!isVisible){tile.textContent='';return}
        if(hero){tile.classList.add('hero');tile.textContent='💙';return}
        if(wardenAwake&&isAt(warden,p)){tile.classList.add('warden');tile.textContent='👁️';return}
        if(isAt(portal,p)){tile.classList.add('portal');tile.textContent=relics.every(r=>r.found)?'🌀':'⌂';return}
        const relic=relics.find(r=>!r.found&&isAt(r,p));if(relic){tile.classList.add('relic');tile.textContent='💎';return}
        const chest=chests.find(c=>!c.opened&&isAt(c,p));if(chest){tile.classList.add('chest');tile.textContent='📦';return}
        const sensor=sensors.find(c=>!c.triggered&&isAt(c,p));if(sensor){tile.classList.add('sensor');tile.textContent='🔹';return}
        if(wool.some(w=>isAt(w,p))){tile.classList.add('wool');tile.textContent='☁️';return}
        tile.textContent=map[y][x]?'':'·';
      });
      hud();
    }
    function end(won,reason){
      if(done)return;done=true;window.__city62Token++;
      field.hidden=true;out.replaceChildren();
      if(won){stats.wins++;saveStats(stats);rewardChallenge(34+Math.max(0,maxMoves-moves)*.18,'Древний город исследован! Ты вернулся с реликвиями.');ach('Повелитель Древнего города');ach('Тихий исследователь');}
      const title=document.createElement('h3');title.textContent=won?'🏆 Экспедиция завершена!':'💔 Экспедиция окончена';out.append(title);
      const summary=document.createElement('p');summary.textContent=reason+' · Реликвии: '+relics.filter(r=>r.found).length+'/'+required+' · Сундуки: '+chests.filter(c=>c.opened).length+'/'+chestCount+' · Шаги: '+moves;out.append(summary);
      const record=document.createElement('p');record.className='city62-help';record.textContent='📜 Всего экспедиций: '+stats.runs+' · Побед: '+stats.wins+' · Найдено реликвий: '+stats.relics+' · Открыто сундуков: '+stats.chests;out.append(record);
      btn('🏛️ Новая экспедиция',()=>window.city62Restart&&window.city62Restart());
      btn('↩️ В приключения',()=>{const cityButton=document.querySelector('[data-v5="city"]');if(cityButton)cityButton.click()});
    }
    function wardenMove(){
      if(!wardenAwake||wardenStun>0)return;
      const distances=distanceMap(map,pos);let best=null,bestD=Infinity;
      for(const [dx,dy] of directions){const p={x:warden.x+dx,y:warden.y+dy};if(!map[p.y]||map[p.y][p.x]!==0)continue;const d=distances.get(p.x+','+p.y);if(d!==undefined&&d<bestD){bestD=d;best=p}}
      if(best)warden=best;
      if(isAt(warden,pos)){health--;warden={...wardenSpawn};wardenStun=2;setLog('💥 Страж настиг тебя! Потеряно ❤️. Он отступил в тень. Используй фонарь или шерсть.');if(health<=0){end(false,'Страж забрал все силы.');return}}
    }
    function move(dx,dy){
      if(done||token!==window.__city62Token)return;
      const nx=pos.x+dx,ny=pos.y+dy;if(!map[ny]||map[ny][nx]!==0)return;
      pos={x:nx,y:ny};moves++;
      const isWool=wool.some(w=>isAt(w,pos));
      if(!isWool)noise=Math.min(7,noise+1);
      const relic=relics.find(r=>!r.found&&isAt(r,pos));
      if(relic){relic.found=true;stats.relics++;saveStats(stats);setLog('✨ Найдена древняя реликвия! '+relics.filter(r=>r.found).length+'/'+required);}
      const chest=chests.find(c=>!c.opened&&isAt(c,pos));
      if(chest){chest.opened=true;stats.chests++;saveStats(stats);const gems=6+Math.floor(Math.random()*7);changeCoins(gems);lantern++;setLog('📦 Сундук открыт! +'+gems+' 💎 и +1 заряд душевного фонаря.');}
      const sensor=sensors.find(c=>!c.triggered&&isAt(c,pos));
      if(sensor){sensor.triggered=true;noise=Math.min(7,noise+3);setLog('🔊 Скалк-сенсор сработал! Шум резко вырос. Страж может проснуться!')}
      if(noise>=7&&!wardenAwake){wardenAwake=true;setLog('👁️ СТРАЖ ПРОСНУЛСЯ! Используй фонарь и ищи шерсть, чтобы заглушить шаги.')}
      if(wardenStun>0)wardenStun--;
      else if(wardenAwake){wardenStep++;if(wardenStep%2===0)wardenMove()}
      if(done)return;
      if(relics.every(r=>r.found)&&isAt(pos,portal)){end(true,'Ты вернулся к порталу с древними реликвиями!');return}
      if(moves>=maxMoves){end(false,'Закончились шаги.');return}
      render();
    }
    function useLantern(){if(done||!wardenAwake||wardenStun>0||lantern<=0)return;lantern--;wardenStun=4;noise=Math.max(0,noise-2);setLog('🔦 Душевный фонарь ослепил Стража на 4 хода!');hud();render()}
    function diary(){const lines=['Экспедиция №'+stats.runs,'Сложность: '+difficulty,'Найдено реликвий: '+relics.filter(r=>r.found).length+'/'+required,'Открыто сундуков: '+chests.filter(c=>c.opened).length+'/'+chestCount,'Страж: '+(wardenAwake?'проснулся':'не проснулся'),'Шум: '+noise+'/7','Здоровье: '+health+'/'+maxHealth];setLog('📜 '+lines.join(' · '))}
    function moveByKey(e){if(token!==window.__city62Token||!field.classList.contains('city62-grid')||e.altKey||e.ctrlKey||e.metaKey||e.repeat)return;const keys={ArrowUp:[0,-1],KeyW:[0,-1],ArrowLeft:[-1,0],KeyA:[-1,0],ArrowDown:[0,1],KeyS:[0,1],ArrowRight:[1,0],KeyD:[1,0]};const v=keys[e.code];if(v&&field.isConnected&&!field.hidden){e.preventDefault();move(v[0],v[1])}}
    moveUp.onclick=()=>move(0,-1);moveLeft.onclick=()=>move(-1,0);moveDown.onclick=()=>move(0,1);moveRight.onclick=()=>move(1,0);
    lanternBtn.onclick=useLantern;statsBtn.onclick=diary;
    let touch=null;field.onpointerdown=e=>{touch=[e.clientX,e.clientY]};field.onpointerup=e=>{if(!touch)return;const dx=e.clientX-touch[0],dy=e.clientY-touch[1];touch=null;if(Math.max(Math.abs(dx),Math.abs(dy))<18)return;Math.abs(dx)>Math.abs(dy)?move(Math.sign(dx),0):move(0,Math.sign(dy))};
    document.addEventListener('keydown',moveByKey);
    window.city62Restart=()=>{document.removeEventListener('keydown',moveByKey);const b=document.querySelector('[data-v5="city"]');if(b)b.click()};
    render();
  };
})();