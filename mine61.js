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
  const DROPS = [
    {id:'flesh',name:'Гнилая плоть',icon:'🥩',from:'zombie'},
    {id:'bone',name:'Кость',icon:'🦴',from:'skeleton'},
    {id:'powder',name:'Порох',icon:'💣',from:'creeper'},
    {id:'string',name:'Нить',icon:'🧵',from:'spider'},
    {id:'slimeball',name:'Сгусток слизи',icon:'🟢',from:'slime'}
  ];
  const RECIPES = [
    {id:'potion',name:'Зелье лечения',icon:'🧪',desc:'Восстанавливает 5 здоровья в шахте',cost:{bone:1,lapis:1}},
    {id:'bomb',name:'Бомба',icon:'💣',desc:'Наносит мобу 3 урона',cost:{powder:1,redstone:1}},
    {id:'net',name:'Ловчая сеть',icon:'🕸️',desc:'Один раз отменяет ответный удар моба',cost:{string:2,slimeball:1}},
    {id:'pickaxe',name:'Железная кирка',icon:'⛏️',desc:'Даёт +1 урон обычным ударам в одном походе',cost:{iron:3,coal:2}},
    {id:'armor',name:'Алмазная броня',icon:'🛡️',desc:'Добавляет 3 щита в следующей шахте',cost:{diamond:1,iron:2}}
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
  .mine61-result{display:flex;flex-wrap:wrap;gap:7px;margin-top:10px}\n  .mine61-recipe{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:9px 0;border-top:1px solid #315568}\n  .mine61-recipe button{min-width:86px;min-height:40px;border-radius:9px;background:#225b48;color:#eafff3;border:1px solid #6ac49b}\n  .mine61-recipe button:disabled{opacity:.45}\n  .mine61-recipe p{margin:4px 0 0}
  @media(max-width:420px){#v5field.mine61-grid{gap:3px!important;padding:6px!important}#v5field.mine61-grid .mine61-cell{font-size:17px!important;border-width:1px!important}}
  `;
  document.head.append(style);

  function readCollection() {
    let data = {};
    try { data = JSON.parse(localStorage.getItem(STORAGE) || '{}') || {}; } catch (_) {}
    return {ores:{...Object.fromEntries(ORES.map(o=>[o.id,0])),...(data.ores||{})},drops:{...Object.fromEntries(DROPS.map(o=>[o.id,0])),...(data.drops||{})},items:{potion:0,bomb:0,net:0,pickaxe:0,armor:0,...(data.items||{})},crafted:{...(data.crafted||{})},runs:Number(data.runs)||0,wins:Number(data.wins)||0,mobs:Number(data.mobs)||0};
  }
  function writeCollection(data) {try {localStorage.setItem(STORAGE,JSON.stringify(data));} catch (_) {}}
  function shuffle(arr) {for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]]}return arr;}


  // Отдельная мастерская: доступна до начала шахты и после любого похода.
  window.openMineWorkshop = function({field,out,clear,btn,mine,ach}) {
    clear();
    function render() {
      out.replaceChildren();
      const title=document.createElement('h3');title.textContent='🛠️ Мастерская шахтёра';out.append(title);
      const data=readCollection();
      const summary=document.createElement('p');summary.className='mine61-hint';
      summary.textContent='⛏️ Руды: '+ORES.map(o=>o.icon+' '+o.name+' ×'+(data.ores[o.id]||0)).join(' · ');
      out.append(summary);
      const trophies=document.createElement('p');trophies.className='mine61-hint';
      trophies.textContent='🧟 Трофеи: '+DROPS.map(d=>d.icon+' '+d.name+' ×'+(data.drops[d.id]||0)).join(' · ');
      out.append(trophies);
      const inv=document.createElement('div');inv.className='mine61-collection';
      const invTitle=document.createElement('strong');invTitle.textContent='🎒 Готовые предметы';inv.append(invTitle);
      const invGrid=document.createElement('div');invGrid.className='mine61-collection-grid';
      RECIPES.forEach(r=>{const el=document.createElement('span');el.textContent=r.icon+' '+r.name+' ×'+(data.items[r.id]||0);invGrid.append(el)});
      inv.append(invGrid);out.append(inv);
      RECIPES.forEach(recipe=>{
        const row=document.createElement('div');row.className='mine61-collection mine61-recipe';
        const info=document.createElement('div');
        const name=document.createElement('strong');name.textContent=recipe.icon+' '+recipe.name;
        const desc=document.createElement('p');desc.className='mine61-hint';desc.textContent=recipe.desc+' · Рецепт: '+Object.entries(recipe.cost).map(([id,n])=>{const item=DROPS.find(d=>d.id===id)||ORES.find(o=>o.id===id);return (item?item.icon+' '+item.name:id)+' ×'+n}).join(' + ');
        info.append(name,desc);
        const make=document.createElement('button');make.type='button';make.textContent='Создать';
        make.disabled=Object.entries(recipe.cost).some(([id,n])=>(data.drops[id]??data.ores[id]??0)<n);
        make.onclick=()=>{
          const fresh=readCollection();
          if(Object.entries(recipe.cost).some(([id,n])=>(fresh.drops[id]??fresh.ores[id]??0)<n)){render();return;}
          for(const [id,n] of Object.entries(recipe.cost)){if(fresh.drops[id]!==undefined)fresh.drops[id]-=n;else fresh.ores[id]-=n;}
          fresh.items[recipe.id]=(fresh.items[recipe.id]||0)+1;
          fresh.crafted[recipe.id]=(fresh.crafted[recipe.id]||0)+1;
          writeCollection(fresh);if(ach)ach('Мастер шахты');render();
        };
        row.append(info,make);out.append(row);
      });
      const note=document.createElement('p');note.className='mine61-hint';
      note.textContent='🧪 Зелье лечит в шахте · 💣 Бомба и 🕸️ сеть помогают в бою · ⛏️ Кирка и 🛡️ броня усиливают следующий поход.';
      out.append(note);
      if(btn&&mine)btn('⛏️ Вернуться к шахте',mine);
    }
    render();
  };

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
    let battleActions=[],workshopOpen=false,bonusPickaxe=data.items.pickaxe>0;
    if(bonusPickaxe)data.items.pickaxe--;
    if(data.items.armor>0){data.items.armor--;shields+=3;}
    writeCollection(data);

    const hud=document.createElement('div');hud.className='adventure-info mine61-top';out.append(hud);
    const toolbar=document.createElement('div');toolbar.className='mine61-toolbar';out.append(toolbar);
    const torchBtn=document.createElement('button');torchBtn.type='button';toolbar.append(torchBtn);
    const collectionBtn=document.createElement('button');collectionBtn.type='button';collectionBtn.textContent='🎒 Рюкзак';toolbar.append(collectionBtn);
    const workshopBtn=document.createElement('button');workshopBtn.type='button';workshopBtn.textContent='🛠️ Мастерская';toolbar.append(workshopBtn);
    const potionBtn=document.createElement('button');potionBtn.type='button';toolbar.append(potionBtn);
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
    function hudUpdate(){hud.innerHTML=`<strong>❤️ ${hp}/${settings.hp} · ⛏️ ${found}/${settings.goal}</strong><span>💎 Очки: ${points} · 🛡️ ${shields} · 🔦 ${torches}</span>`;torchBtn.textContent=(torchMode?'✓ ':'')+'🔦 Факел ×'+torches;torchBtn.classList.toggle('active',torchMode);torchBtn.disabled=torches===0||!!battle||ended;potionBtn.textContent='🧪 Зелье ×'+data.items.potion;potionBtn.disabled=!data.items.potion||hp>=settings.hp||ended||!!battle;}
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
      [['⚔️ Удар', 'attack'],['🛡️ Щит ('+shields+')','shield'],['💨 Уклониться','dodge'],['💣 Бомба ×'+data.items.bomb,'bomb'],['🕸️ Сеть ×'+data.items.net,'net']].forEach(([label,action])=>{
        const b=document.createElement('button');b.type='button';b.textContent=label;b.disabled=(action==='shield'&&shields===0)||(action==='bomb'&&!data.items.bomb)||(action==='net'&&!data.items.net);b.onclick=()=>combat(action);actions.append(b);battleActions.push(b);
      });hudUpdate();
    }
    function combat(action){if(!valid()||ended||!battle)return;let defended=false,evaded=false,usedNet=false,damage=0;
      if(action==='attack'){damage=1+Math.floor(Math.random()*3)+(bonusPickaxe?1:0);battle.hp-=damage;}
      else if(action==='shield'&&shields>0){shields--;defended=true;battle.hp-=1;damage=1;}
      else if(action==='dodge'){evaded=Math.random()<.7;if(evaded){battle.hp-=1;damage=1;}}
      else if(action==='bomb'&&data.items.bomb>0){data.items.bomb--;damage=3;battle.hp-=damage;writeCollection(data);}
      else if(action==='net'&&data.items.net>0){data.items.net--;usedNet=true;writeCollection(data);}
      if(battle.hp<=0){const defeatedMob=battle.id;defeated++;data.mobs++;const drop=DROPS.find(d=>d.from===defeatedMob);if(drop){const amount=1+(Math.random()<.35?1:0);data.drops[drop.id]=(Number(data.drops[drop.id])||0)+amount;writeCollection(data);log('🏆 '+battle.name+' побеждён! Выпало: '+drop.icon+' '+drop.name+' ×'+amount+'.');}ach('Охотник на мобов');battle=null;renderBattle();return;}
      battle.turn++;
      const explodes=battle.id==='creeper'&&battle.turn>=2;const hit=battle.id==='creeper'&&!explodes?0:battle.damage;
      const taken=defended||evaded||usedNet?0:hit;
      hp=Math.max(0,hp-taken);
      log((damage?'⚔️ Ты нанёс '+damage+' урона. ':'')+(usedNet?'🕸️ Сеть опутала моба — он пропустил ход!':defended?'🛡️ Щит защитил!':evaded?'💨 Ты увернулся!':'💥 '+battle.name+' нанёс '+taken+' урона!'));
      if(hp===0){battle=null;finish(false);return;}if(explodes){log('💥 Крипер взорвался! '+(taken?'Потеряно '+taken+' здоровья.':'Щит или уклонение спасли тебя!'));battle=null;}renderBattle();
    }
    function collection(){collectionBox.hidden=!collectionBox.hidden;if(collectionBox.hidden)return;
      const heading=document.createElement('strong');heading.textContent='🎒 Твоя коллекция руды';const grid=document.createElement('div');grid.className='mine61-collection-grid';
      for(const ore of ORES){const span=document.createElement('span');span.textContent=ore.icon+' '+ore.name+': '+(data.ores[ore.id]||0);grid.append(span);}
      const dropTitle=document.createElement('strong');dropTitle.textContent='🧟 Трофеи с мобов';const dropGrid=document.createElement('div');dropGrid.className='mine61-collection-grid';for(const drop of DROPS){const span=document.createElement('span');span.textContent=drop.icon+' '+drop.name+': '+(data.drops[drop.id]||0);dropGrid.append(span);}
      const foot=document.createElement('p');foot.className='mine61-hint';foot.textContent='🏆 Побед: '+data.wins+' · ⚔️ Побеждено мобов: '+data.mobs+' · ⛏️ Заходов: '+data.runs;
      collectionBox.replaceChildren(heading,grid,dropTitle,dropGrid,foot);
    }
    function finish(won){if(ended||!valid())return;ended=true;torchMode=false;battle=null;battleActions=[];battleBox.hidden=true;field.hidden=true;out.replaceChildren();
      if(won){data.wins++;writeCollection(data);rewardChallenge(10+Math.round(points*.7),'Сокровища шахты добыты!');ach('Шахтёр');out.replaceChildren();}
      const title=document.createElement('h3');title.textContent=won?'🏆 Шахта пройдена!':'💔 Варденяшка выбрался из шахты без сил';out.append(title);
      const result=document.createElement('p');result.textContent='⛏️ Добыто руды: '+found+' · 💎 Очков: '+points+' · ⚔️ Побеждено мобов: '+defeated+'. Добытая руда осталась в коллекции.';out.append(result);
      if(!won){const note=document.createElement('p');note.textContent='Попробуй лёгкий уровень, используй факелы и щит. Собранная руда не пропадает.';out.append(note);}
      const actions=document.createElement('div');actions.className='mine61-result';out.append(actions);
      const again=document.createElement('button');again.textContent='⛏️ Новая шахта';again.onclick=mine;actions.append(again);
      const workshopAgain=document.createElement('button');workshopAgain.textContent='🛠️ Мастерская';workshopAgain.onclick=()=>{workshopOpen=false;workshop();};actions.append(workshopAgain);
      const show=document.createElement('button');show.textContent='🎒 Мои руды';show.onclick=()=>{const old=out.querySelector('.mine61-collection');if(old){old.remove();return;}const div=document.createElement('div');div.className='mine61-collection';div.innerHTML='<strong>🎒 Добытые руды</strong>';const grid=document.createElement('div');grid.className='mine61-collection-grid';for(const ore of ORES){const item=document.createElement('span');item.textContent=ore.icon+' '+ore.name+': '+(data.ores[ore.id]||0);grid.append(item)}div.append(grid);out.append(div)};actions.append(show);
    }
    function workshop(){if(!valid())return;workshopOpen=!workshopOpen;const old=out.querySelector('.mine61-workshop');if(old){old.remove();if(!workshopOpen)return;}const box=document.createElement('div');box.className='mine61-collection mine61-workshop';const title=document.createElement('strong');title.textContent='🛠️ Мастерская — создай полезные предметы';box.append(title);const inventory=document.createElement('p');inventory.className='mine61-hint';inventory.textContent='Руды: '+ORES.map(o=>o.icon+' '+(data.ores[o.id]||0)).join(' · ')+' | Трофеи: '+DROPS.map(d=>d.icon+' '+(data.drops[d.id]||0)).join(' · ');box.append(inventory);const stash=document.createElement('p');stash.className='mine61-hint';stash.textContent='🎒 Предметы: '+RECIPES.map(r=>r.icon+' '+r.name+' ×'+(data.items[r.id]||0)).join(' · ');box.append(stash);RECIPES.forEach(recipe=>{const row=document.createElement('div');row.className='mine61-recipe';const info=document.createElement('div');const name=document.createElement('strong');name.textContent=recipe.icon+' '+recipe.name+' ×'+(data.items[recipe.id]||0);const desc=document.createElement('p');desc.className='mine61-hint';desc.textContent=recipe.desc+' · Нужно: '+Object.entries(recipe.cost).map(([id,n])=>{const item=DROPS.find(d=>d.id===id)||ORES.find(o=>o.id===id);return (item?.icon||'')+' '+(item?.name||id)+' ×'+n}).join(', ');info.append(name,desc);const make=document.createElement('button');make.type='button';make.textContent='Создать';make.disabled=Object.entries(recipe.cost).some(([id,n])=>(data.drops[id]??data.ores[id]??0)<n);make.onclick=()=>{for(const [id,n] of Object.entries(recipe.cost)){if(data.drops[id]!==undefined)data.drops[id]-=n;else data.ores[id]-=n;}data.items[recipe.id]=(data.items[recipe.id]||0)+1;data.crafted[recipe.id]=(data.crafted[recipe.id]||0)+1;if(!ended&&recipe.id==='armor'){shields+=3;data.items.armor--;}if(!ended&&recipe.id==='pickaxe'){bonusPickaxe=true;data.items.pickaxe--;}writeCollection(data);ach('Мастер шахты');log('✨ Создано: '+recipe.name+'!');box.remove();workshopOpen=false;hudUpdate();workshop();};row.append(info,make);box.append(row)});out.append(box);}
    torchBtn.onclick=()=>{if(!valid()||battle||ended||torches===0)return;torchMode=!torchMode;log(torchMode?'🔦 Нажми на блок — факел покажет содержимое соседних клеток.':'⛏️ Режим добычи.');hudUpdate();};
    potionBtn.onclick=()=>{if(!valid()||ended||battle||!data.items.potion||hp>=settings.hp)return;data.items.potion--;const healed=Math.min(5,settings.hp-hp);hp+=healed;writeCollection(data);log('🧪 Зелье использовано: +'+healed+' здоровья!');hudUpdate();};
    collectionBtn.onclick=collection;workshopBtn.onclick=workshop;
    document.addEventListener('keydown',function combatKeys(e){if(!valid()||ended){document.removeEventListener('keydown',combatKeys,true);return;}if(!battle||e.altKey||e.ctrlKey||e.metaKey)return;
      const idx=e.code==='Digit1'||e.code==='Numpad1'||e.code==='Space'?0:e.code==='Digit2'||e.code==='Numpad2'?1:e.code==='Digit3'||e.code==='Numpad3'?2:-1;
      if(idx>=0){e.preventDefault();e.stopPropagation();if(!e.repeat&&battleActions[idx]&&!battleActions[idx].disabled)battleActions[idx].click();}
    },true);
    hudUpdate();log('⛏️ Добудь '+settings.goal+' рудных блоков. Побеждай мобов, собирай трофеи и создавай снаряжение в мастерской!');
  };
})();