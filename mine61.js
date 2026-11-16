/* Варденяшка 6.1: Шахта с мобами и рудами. No dependencies. */
(() => {
  'use strict';
  const STORAGE = 'warden_mine_v61';
  const ORES = [
    {id:'coal',name:'Уголь',icon:'⚫',points:1,color:'#303843'},
    {id:'copper',name:'Медь',icon:'🟠',points:2,color:'#e68a53'},
    {id:'iron',name:'Железо',icon:'⚪',points:3,color:'#cbd7dd'},
    {id:'gold',name:'Золото',icon:'🟡',points:4,color:'#f5c947'},
    {id:'redstone',name:'Редстоун',icon:'🔴',points:4,color:'#f14648'},
    {id:'lapis',name:'Лазурит',icon:'🔵',points:4,color:'#437cef'},
    {id:'emerald',name:'Изумруд',icon:'🟢',points:6,color:'#36e98c'},
    {id:'diamond',name:'Алмаз',icon:'💎',points:9,color:'#55f1f7'}
  ];
  const MOBS = [
    {id:'zombie',name:'Зомби',icon:'🧟',hp:3,damage:1},
    {id:'skeleton',name:'Скелет',icon:'💀',hp:3,damage:2},
    {id:'creeper',name:'Крипер',icon:'🟩',hp:3,damage:3},
    {id:'spider',name:'Паук',icon:'🕷️',hp:2,damage:1},
    {id:'slime',name:'Слизень',icon:'🟢',hp:2,damage:1}
  ];
  const style = document.createElement('style');
  style.id = 'mine61-style';
  style.textContent = `
  #v5field.mine61-grid{height:auto!important;max-height:none!important;display:grid!important;grid-template-columns:repeat(var(--mine-cols),minmax(0,1fr))!important;gap:5px!important;padding:9px!important;overflow:visible!important;touch-action:manipulation!important;border:3px solid #556c77;background:repeating-linear-gradient(135deg,#102431 0 16px,#0a1c27 16px 32px)!important;box-shadow:inset 0 0 25px #000b}
  #v5field.mine61-grid[hidden]{display:none!important}
  #v5field.mine61-grid .mine61-cell{position:relative!important;display:flex!important;align-items:center;justify-content:center;width:100%!important;min-width:0!important;min-height:0!important;aspect-ratio:1!important;padding:0!important;border:2px solid #3b5261!important;border-radius:4px!important;box-shadow:inset 3px 3px #ffffff0b,inset -4px -4px #0009,0 3px 0 #06111a!important;color:#f3ffff;font-size:clamp(16px,3.8vw,28px)!important;text-shadow:1px 2px #000a;background:repeating-linear-gradient(45deg,#344552 0 8px,#2b3b47 8px 16px)!important;image-rendering:pixelated;transition:filter .12s,transform .12s;cursor:pointer}
  #v5field.mine61-grid .mine61-cell:disabled{opacity:1!important;cursor:default}
  #v5field.mine61-grid .mine61-cell:not(:disabled):active{transform:scale(.93);filter:brightness(1.35)}
  #v5field.mine61-grid .mine61-cell.mine61-open{background:repeating-linear-gradient(45deg,#253440 0 9px,#1b2b38 9px 18px)!important}
  #v5field.mine61-grid .mine61-cell.mine61-ore{background:radial-gradient(circle at 28% 30%,var(--ore) 0 10%,transparent 11%),radial-gradient(circle at 71% 64%,var(--ore) 0 13%,transparent 14%),radial-gradient(circle at 72% 20%,var(--ore) 0 7%,transparent 8%),repeating-linear-gradient(45deg,#3c4b54 0 9px,#293741 9px 18px)!important;border-color:var(--ore)!important;box-shadow:inset 2px 2px #ffffff24,0 0 12px color-mix(in srgb,var(--ore) 35%,transparent)!important}
  #v5field.mine61-grid .mine61-cell.mine61-mob{background:repeating-linear-gradient(45deg,#493f49 0 8px,#272431 8px 16px)!important;border-color:#d887b5!important}
  #v5field.mine61-grid .mine61-cell.mine61-lava{background:repeating-linear-gradient(30deg,#e34a0e 0 8px,#f9a32d 8px 15px,#b92317 15px 22px)!important;border-color:#ffb04e!important}
  #v5field.mine61-grid .mine61-cell.mine61-chest{background:repeating-linear-gradient(90deg,#a66c30 0 9px,#704321 9px 18px)!important;border-color:#f6cc7c!important}
  #v5field.mine61-grid .mine61-cell.mine61-peek{border-color:#f5df7b!important;box-shadow:inset 0 0 0 2px #f5df7b88,0 0 12px #f5df7b55!important}
  .mine61-top{display:flex;justify-content:space-between;align-items:center;gap:7px;flex-wrap:wrap;font-size:13px;line-height:1.5}
  .mine61-top strong{font-size:15px;color:#c7fbff}
  .mine61-toolbar{display:flex;flex-wrap:wrap;gap:7px;margin:9px 0}
  #v5out .mine61-toolbar button,#v5out .mine61-battle button,#v5out .mine61-result button{font-size:13px;min-height:42px;padding:8px 10px;border-radius:10px;box-shadow:0 2px 0 #03131d;flex:1 1 115px}
  #v5out .mine61-toolbar button.active{background:#4b6b22;border-color:#ecf79d}
  .mine61-hint{font-size:12px;color:#c0e5eb;margin:7px 0 0;line-height:1.5}
  .mine61-message{font-size:13px;color:#f7e1a3;min-height:20px;margin:8px 0 0}
  .mine61-battle{border:2px solid #b65d68;border-radius:12px;padding:12px;background:linear-gradient(130deg,#422431,#211d30);margin-top:10px}
  .mine61-battle-head{display:flex;gap:11px;align-items:center;font-size:15px;margin-bottom:8px}
  .mine61-battle-avatar{display:grid;place-items:center;width:65px;height:65px;flex:0 0 65px;border:3px solid #a9a9a9;background:#17292b;box-shadow:inset 0 0 0 5px #223943;font-size:39px;image-rendering:pixelated}
  .mine61-battle-actions{display:flex;flex-wrap:wrap;gap:7px;margin-top:10px}
  .mine61-collection{border:1px solid #437383;border-radius:10px;padding:9px;background:#092533;margin-top:9px}
  .mine61-collection-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:5px;font-size:12px;margin-top:6px}
  .mine61-collection-grid span{padding:6px;background:#153647;border-radius:5px}
  .mine61-result{display:flex;flex-wrap:wrap;gap:7px;margin-top:10px}
  @media(max-width:420px){#v5field.mine61-grid{gap:3px!important;padding:6px!important}#v5field.mine61-grid .mine61-cell{font-size:17px!important;border-width:1px!important}}
  `;
  document.head.append(style);

  function readCollection() {
    let data = {};
    try { data = JSON.parse(localStorage.getItem(STORAGE) || '{}') || {}; } catch (_) {}
    return {ores:{...Object.fromEntries(ORES.map(o=>[o.id,0])),...(data.ores||{})},runs:Number(data.runs)||0,wins:Number(data.wins)||0,mobs:Number(data.mobs)||0};
  }
  function writeCollection(data) {try {localStorage.setItem(STORAGE,JSON.stringify(data));} catch (_) {}}
  function shuffle(arr) {for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]]}return arr;}

  window.startMine61 = function({difficulty,begin,isCurrent,field,out,rewardChallenge,ach,btn,mine}) {
    const token = begin();
    const settings = difficulty==='easy'?{cols:5,ore:12,mobs:3,lava:2,chests:2,goal:6,hp:15,torches:3,shields:4}:
      difficulty==='hard'?{cols:6,ore:18,mobs:8,lava:4,chests:2,goal:11,hp:12,torches:2,shields:2}:
      {cols:6,ore:18,mobs:6,lava:3,chests:3,goal:9,hp:14,torches:3,shields:3};
    const valid = () => isCurrent(token);
    const data = readCollection(); data.runs++; writeCollection(data);
    const total = settings.cols*settings.cols;
    const cells = [];
    const orePool = ORES.map(o=>({kind:'ore',value:o}));
    while(orePool.length<settings.ore) orePool.push({kind:'ore',value:ORES[Math.floor(Math.random()*ORES.length)]});
    const mobPool = shuffle([...MOBS]).slice(0,settings.mobs).map(m=>({kind:'mob',value:m}));
    while(mobPool.length<settings.mobs) mobPool.push({kind:'mob',value:MOBS[Math.floor(Math.random()*MOBS.length)]});
    const layout = shuffle([...orePool,...mobPool,...Array.from({length:settings.lava},()=>({kind:'lava'})),...Array.from({length:settings.chests},()=>({kind:'chest'}))]);
    while(layout.length<total)layout.push({kind:'rock'});
    shuffle(layout);
    let hp=settings.hp,torches=settings.torches,shields=settings.shields,found=0,points=0,defeated=0,ended=false,battle=null,torchMode=false;
    let battleActions=[];

    const hud=document.createElement('div');hud.className='adventure-info mine61-top';out.append(hud);
    const toolbar=document.createElement('div');toolbar.className='mine61-toolbar';out.append(toolbar);
    const torchBtn=document.createElement('button');torchBtn.type='button';toolbar.append(torchBtn);
    const collectionBtn=document.createElement('button');collectionBtn.type='button';collectionBtn.textContent='🎒 Коллекция';toolbar.append(collectionBtn);
    const hint=document.createElement('p');hint.className='mine61-hint';hint.textContent='⛏️ Нажимай на камень, чтобы добывать руду. 🔦 Факел подсвечивает соседние блоки. Мобы нападают — сражайся или защищайся!';out.append(hint);
    const message=document.createElement('p');message.className='mine61-message';message.setAttribute('aria-live','polite');out.append(message);
    const battleBox=document.createElement('div');battleBox.className='mine61-battle';battleBox.hidden=true;out.append(battleBox);
    const collectionBox=document.createElement('div');collectionBox.className='mine61-collection';collectionBox.hidden=true;out.append(collectionBox);
    field.hidden=false;field.className='mine61-grid';field.style.setProperty('--mine-cols',String(settings.cols));
    field.setAttribute('aria-label','Шахта: сетка '+settings.cols+' на '+settings.cols);
    const tileButtons=layout.map((cell,i)=>{
      const b=document.createElement('button');b.type='button';b.className='mine61-cell';b.setAttribute('aria-label','Раскопать блок '+(i+1));
      b.addEventListener('click',()=>tapCell(i));field.append(b);cells.push({type:cell,button:b,open:false,peek:false});return b;
    });
    function hudUpdate(){hud.innerHTML=`<strong>❤️ ${hp}/${settings.hp} · ⛏️ ${found}/${settings.goal}</strong><span>💎 Очки руды: ${points} · 🛡️ ${shields} · 🔦 ${torches}</span>`;torchBtn.textContent=(torchMode?'✓ ':'')+'🔦 Факел ×'+torches;torchBtn.classList.toggle('active',torchMode);torchBtn.disabled=torches===0||!!battle||ended;}
    function log(text){message.textContent=text;}
    function revealVisual(cell){const {type,button:b}=cell;cell.open=true;b.disabled=true;b.classList.add('mine61-open');b.classList.remove('mine61-peek');
      if(type.kind==='ore'){b.classList.add('mine61-ore');b.style.setProperty('--ore',type.value.color);b.textContent=type.value.icon;b.title=type.value.name;b.setAttribute('aria-label',type.value.name);}
      if(type.kind==='mob'){b.classList.add('mine61-mob');b.textContent=type.value.icon;b.title=type.value.name;b.setAttribute('aria-label',type.value.name);}
      if(type.kind==='lava'){b.classList.add('mine61-lava');b.textContent='🔥';b.title='Лава';}
      if(type.kind==='chest'){b.classList.add('mine61-chest');b.textContent='📦';b.title='Сундук';}
      if(type.kind==='rock'){b.textContent='🪨';b.title='Камень';}
    }
    function preview(i){const c=cells[i];if(!c||c.open)return;c.peek=true;c.button.classList.add('mine61-peek');const t=c.type;
      c.button.textContent=t.kind==='ore'?t.value.icon:t.kind==='mob'?t.value.icon:t.kind==='lava'?'🔥':t.kind==='chest'?'📦':'🪨';
      c.button.title='Подсвечено факелом: '+(t.value?.name||({lava:'Лава',chest:'Сундук',rock:'Камень'}[t.kind]));
      c.button.setAttribute('aria-label',c.button.title);
    }
    function useTorch(index){if(!torches)return;torches--;torchMode=false;const x=index%settings.cols,y=Math.floor(index/settings.cols);
      for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const xx=x+dx,yy=y+dy;if(xx>=0&&xx<settings.cols&&yy>=0&&yy<settings.cols)preview(yy*settings.cols+xx);}
      log('🔦 Факел осветил 9 соседних блоков. Теперь выбирай, что добывать!');hudUpdate();
    }
    function tapCell(index){if(!valid()||ended||battle)return;const cell=cells[index];if(cell.open)return;if(torchMode){useTorch(index);return;}
      revealVisual(cell);const t=cell.type;
      if(t.kind==='ore'){found++;points+=t.value.points;data.ores[t.value.id]=(Number(data.ores[t.value.id])||0)+1;writeCollection(data);log(t.value.icon+' Добыто: '+t.value.name+'! +'+t.value.points+' очков руды.');if(found>=settings.goal){finish(true);return;}}
      else if(t.kind==='mob'){battle={...t.value,hp:t.value.hp,turn:0};log('⚔️ На тебя напал '+t.value.name+'!');renderBattle();}
      else if(t.kind==='lava'){hp=Math.max(0,hp-(difficulty==='hard'?3:2));log('🔥 Лава! Здоровье уменьшилось.');if(hp===0){finish(false);return;}}
      else if(t.kind==='chest'){const heal=Math.min(settings.hp-hp,3);hp+=heal;shields=Math.min(shields+1,6);log('📦 Сундук! +'+heal+' здоровья и +1 щит.');}
      else log('🪨 Только камень. Попробуй другой блок!');hudUpdate();
    }
    function renderBattle(){battleBox.replaceChildren();battleBox.hidden=!battle;if(!battle){battleActions=[];hudUpdate();return;}
      const head=document.createElement('div');head.className='mine61-battle-head';const avatar=document.createElement('div');avatar.className='mine61-battle-avatar';avatar.textContent=battle.icon;
      const stats=document.createElement('div');const strong=document.createElement('strong');strong.textContent='⚔️ '+battle.name;const p=document.createElement('div');p.textContent='❤️ Враг: '+battle.hp+' · Твоё здоровье: '+hp;stats.append(strong,p);head.append(avatar,stats);battleBox.append(head);
      const actions=document.createElement('div');actions.className='mine61-battle-actions';battleBox.append(actions);
      battleActions=[];
      [['⚔️ Удар', 'attack'],['🛡️ Щит ('+shields+')','shield'],['💨 Уклониться','dodge']].forEach(([label,action])=>{
        const b=document.createElement('button');b.type='button';b.textContent=label;b.disabled=action==='shield'&&shields===0;b.onclick=()=>combat(action);actions.append(b);battleActions.push(b);
      });hudUpdate();
    }
    function combat(action){if(!valid()||ended||!battle)return;let defended=false,evaded=false,damage=0;
      if(action==='attack'){damage=1+Math.floor(Math.random()*3);battle.hp-=damage;}
      else if(action==='shield'&&shields>0){shields--;defended=true;battle.hp-=1;damage=1;}
      else if(action==='dodge'){evaded=Math.random()<.7;if(evaded){battle.hp-=1;damage=1;}}
      if(battle.hp<=0){defeated++;data.mobs++;writeCollection(data);log('🏆 '+battle.name+' побеждён! Урон: '+damage+'.');ach('Охотник на мобов');battle=null;renderBattle();return;}
      battle.turn++;
      const explodes=battle.id==='creeper'&&battle.turn>=2;const hit=battle.id==='creeper'&&!explodes?0:battle.damage;
      const taken=defended||evaded?0:hit;
      hp=Math.max(0,hp-taken);
      log((damage?'⚔️ Ты нанёс '+damage+' урона. ':'')+(defended?'🛡️ Щит защитил!':evaded?'💨 Ты увернулся!':'💥 '+battle.name+' нанёс '+taken+' урона!'));
      if(hp===0){battle=null;finish(false);return;}if(explodes){log('💥 Крипер взорвался! '+(taken?'Потеряно '+taken+' здоровья.':'Щит или уклонение спасли тебя!'));battle=null;}renderBattle();
    }
    function collection(){collectionBox.hidden=!collectionBox.hidden;if(collectionBox.hidden)return;
      const heading=document.createElement('strong');heading.textContent='🎒 Твоя коллекция руды';const grid=document.createElement('div');grid.className='mine61-collection-grid';
      for(const ore of ORES){const span=document.createElement('span');span.textContent=ore.icon+' '+ore.name+': '+(data.ores[ore.id]||0);grid.append(span);}
      const foot=document.createElement('p');foot.className='mine61-hint';foot.textContent='🏆 Побед: '+data.wins+' · ⚔️ Побеждено мобов: '+data.mobs+' · ⛏️ Заходов: '+data.runs;
      collectionBox.replaceChildren(heading,grid,foot);
    }
    function finish(won){if(ended||!valid())return;ended=true;torchMode=false;battle=null;battleActions=[];battleBox.hidden=true;field.hidden=true;out.replaceChildren();
      if(won){data.wins++;writeCollection(data);rewardChallenge(10+Math.round(points*.7),'Сокровища шахты добыты!');ach('Шахтёр');out.replaceChildren();}
      const title=document.createElement('h3');title.textContent=won?'🏆 Шахта пройдена!':'💔 Варденяшка выбрался из шахты без сил';out.append(title);
      const result=document.createElement('p');result.textContent='⛏️ Добыто руды: '+found+' · 💎 Очков: '+points+' · ⚔️ Побеждено мобов: '+defeated+'. Добытая руда осталась в коллекции.';out.append(result);
      if(!won){const note=document.createElement('p');note.textContent='Попробуй лёгкий уровень, используй факелы и щит. Собранная руда не пропадает.';out.append(note);}
      const actions=document.createElement('div');actions.className='mine61-result';out.append(actions);
      const again=document.createElement('button');again.textContent='⛏️ Новая шахта';again.onclick=mine;actions.append(again);
      const show=document.createElement('button');show.textContent='🎒 Мои руды';show.onclick=()=>{const old=out.querySelector('.mine61-collection');if(old){old.remove();return;}const div=document.createElement('div');div.className='mine61-collection';div.innerHTML='<strong>🎒 Добытые руды</strong>';const grid=document.createElement('div');grid.className='mine61-collection-grid';for(const ore of ORES){const item=document.createElement('span');item.textContent=ore.icon+' '+ore.name+': '+(data.ores[ore.id]||0);grid.append(item)}div.append(grid);out.append(div)};actions.append(show);
    }
    torchBtn.onclick=()=>{if(!valid()||battle||ended||torches===0)return;torchMode=!torchMode;log(torchMode?'🔦 Нажми на блок — факел покажет содержимое соседних клеток.':'⛏️ Режим добычи.');hudUpdate();};
    collectionBtn.onclick=collection;
    document.addEventListener('keydown',function combatKeys(e){if(!valid()||ended){document.removeEventListener('keydown',combatKeys,true);return;}if(!battle||e.altKey||e.ctrlKey||e.metaKey)return;
      const idx=e.code==='Digit1'||e.code==='Numpad1'||e.code==='Space'?0:e.code==='Digit2'||e.code==='Numpad2'?1:e.code==='Digit3'||e.code==='Numpad3'?2:-1;
      if(idx>=0){e.preventDefault();e.stopPropagation();if(!e.repeat&&battleActions[idx]&&!battleActions[idx].disabled)battleActions[idx].click();}
    },true);
    hudUpdate();log('⛏️ Добудь '+settings.goal+' рудных блоков и не потеряй всё здоровье!');
  };
})();