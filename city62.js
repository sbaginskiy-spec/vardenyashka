/* Варденяшка 7.1 — Minecraft-inspired deepslate/sculk pixel textures and a detailed 2D Warden sprite model. */
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
    function resize(){const r=view.getBoundingClientRect();cssW=Math.max(280,Math.floor(r.width||360));cssH=Math.max(250,Math.floor(r.height||300));dpr=Math.min(2.5,Math.max(1,window.devicePixelRatio||1));canvas.width=Math.floor(cssW*dpr);canvas.height=Math.floor(cssH*dpr);canvas.style.width='100%';canvas.style.height='100%';if(ctx){ctx.setTransform(dpr,0,0,dpr,0,0);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.lineJoin='round';ctx.lineCap='round';drawScene()}}
    function poly(points,fill,stroke){ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke()}}
    function blockTexture(points,type,seed,tile){
      const palettes={bricks:['#26363d','#304149','#1e2c33','#394a51','#293940'],cobbled:['#202e35','#33434a','#1a272e','#405057','#29383f'],polished:['#2b3b42','#35464d','#25343b','#3d4e54'],chiseled:['#26373e','#34464c','#1c2b32','#415158']};
      let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity;for(const p of points){x0=Math.min(x0,p[0]);y0=Math.min(y0,p[1]);x1=Math.max(x1,p[0]);y1=Math.max(y1,p[1])}
      const pal=palettes[type]||palettes.bricks,s=Math.max(8,tile||20);
      ctx.save();ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);ctx.closePath();ctx.clip();
      const base=ctx.createLinearGradient(x0,y0,x1,y1);base.addColorStop(0,pal[1]);base.addColorStop(.5,pal[0]);base.addColorStop(1,pal[2]);ctx.fillStyle=base;ctx.fillRect(x0,y0,x1-x0,y1-y0);
      const rows=Math.max(2,Math.ceil((y1-y0)/s));
      for(let row=0;row<rows;row++){const top=y0+(y1-y0)*row/rows,bottom=y0+(y1-y0)*(row+1)/rows,rowH=bottom-top,offset=type==='bricks'&&row%2?s*.5:0,cols=Math.ceil((x1-x0)/s)+1;
        for(let col=-1;col<cols;col++){const left=x0+col*s+offset,n=Math.abs((col*37+row*19+seed*23+col*row*7)%pal.length);
          ctx.fillStyle=pal[n];ctx.fillRect(left+1,top+1,Math.max(2,s-2),Math.max(2,rowH-2));ctx.strokeStyle='rgba(5,12,16,.42)';ctx.lineWidth=1;ctx.strokeRect(left+1,top+1,Math.max(2,s-2),Math.max(2,rowH-2));
          if(type==='cobbled'){ctx.fillStyle='rgba(135,154,154,.18)';ctx.fillRect(left+s*.18,top+rowH*.22,Math.max(2,s*.2),1.5);ctx.fillStyle='rgba(3,12,16,.3)';ctx.fillRect(left+s*.65,top+rowH*.67,Math.max(2,s*.17),1.5)}
          if(type==='polished'){ctx.fillStyle='rgba(170,195,194,.12)';ctx.fillRect(left+3,top+3,Math.max(2,s*.4),1)}
          if(type==='chiseled'){ctx.strokeStyle='rgba(8,18,23,.6)';ctx.beginPath();ctx.moveTo(left+s*.25,top+rowH*.25);ctx.lineTo(left+s*.75,top+rowH*.25);ctx.lineTo(left+s*.75,top+rowH*.75);ctx.stroke()}
          if((n+row+col+seed)%19===0){ctx.fillStyle='#1b7775';ctx.fillRect(left+s*.35,top+rowH*.38,3,3);ctx.fillStyle='rgba(112,255,229,.7)';ctx.fillRect(left+s*.48,top+rowH*.48,2,2)}
        }
      }
      ctx.restore();ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);ctx.closePath();ctx.strokeStyle=type==='polished'?'#52666a':'#101e24';ctx.lineWidth=1.25;ctx.stroke();
    }
    function drawWardenModel(x,y,scale,awake){
      ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
      const aura=ctx.createRadialGradient(0,-5,3,0,-5,52);aura.addColorStop(0,awake?'rgba(52,244,224,.42)':'rgba(52,174,170,.20)');aura.addColorStop(.55,'rgba(25,116,119,.12)');aura.addColorStop(1,'rgba(5,25,29,0)');ctx.fillStyle=aura;ctx.fillRect(-55,-88,110,155);
      poly([[-20,20],[-4,20],[-4,48],[-1,53],[-2,58],[-25,58],[-27,53],[-22,47]],'#101d22','#071116');
      poly([[4,20],[20,20],[22,47],[27,53],[25,58],[2,58],[1,53],[4,47]],'#101d22','#071116');
      ctx.fillStyle='#31464b';ctx.fillRect(-24,47,20,7);ctx.fillRect(4,47,20,7);
      poly([[-24,-28],[-38,-24],[-39,5],[-34,28],[-24,27],[-20,7]],'#14262c','#071116');
      poly([[24,-28],[38,-24],[39,5],[34,28],[24,27],[20,7]],'#14262c','#071116');
      ctx.fillStyle='#2b4248';ctx.fillRect(-39,-22,14,14);ctx.fillRect(25,-22,14,14);ctx.fillStyle='#0b171c';ctx.fillRect(-35,18,13,12);ctx.fillRect(22,18,13,12);
      poly([[-24,-34],[-17,-42],[17,-42],[24,-34],[22,25],[14,34],[-14,34],[-22,25]],'#0b171c','#071116');
      poly([[-19,-34],[-13,-38],[13,-38],[19,-34],[18,22],[12,28],[-12,28],[-18,22]],'#1d333a','#31494e');
      ctx.fillStyle='#304b50';ctx.fillRect(-15,-34,30,7);ctx.fillStyle='#477f7c';for(let i=0;i<4;i++){const yy=-17+i*10;ctx.fillRect(-18,yy,10,3);ctx.fillRect(8,yy,10,3)}
      ctx.fillStyle='#102126';ctx.fillRect(-7,-24,14,47);ctx.shadowColor='#55fff0';ctx.shadowBlur=awake?19:10;ctx.fillStyle=awake?'#55eee0':'#328f8d';
      poly([[0,-22],[10,-8],[7,10],[0,17],[-7,10],[-10,-8]],ctx.fillStyle);ctx.shadowBlur=0;ctx.fillStyle='#d2fff5';ctx.fillRect(-2,-9,4,8);ctx.fillStyle='#167f83';ctx.fillRect(-4,3,8,5);
      poly([[-17,-57],[-13,-66],[13,-66],[17,-57],[14,-39],[9,-34],[-9,-34],[-14,-39]],'#0a151a','#050d12');ctx.fillStyle='#284249';ctx.fillRect(-12,-60,24,17);ctx.fillStyle='#172a30';ctx.fillRect(-10,-43,20,7);
      poly([[-13,-56],[-24,-66],[-31,-84],[-25,-88],[-17,-72],[-5,-62]],'#172a30','#071116');poly([[13,-56],[24,-66],[31,-84],[25,-88],[17,-72],[5,-62]],'#172a30','#071116');
      ctx.fillStyle='#486568';ctx.fillRect(-29,-86,5,5);ctx.fillRect(24,-86,5,5);ctx.shadowColor='#9afff2';ctx.shadowBlur=awake?12:5;ctx.fillStyle=awake?'#bafff6':'#5caeaa';ctx.fillRect(-10,-54,7,4);ctx.fillRect(3,-54,7,4);ctx.shadowBlur=0;
      ctx.fillStyle='#4cb7ad';ctx.fillRect(-35,-17,3,9);ctx.fillRect(32,-17,3,9);ctx.restore();
    }
    function drawObject(kind,x,y,scale){
      if(kind==='warden'){drawWardenModel(x,y,scale,wardenAwake);return}ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
      if(kind==='relic'){poly([[-17,0],[0,-22],[17,0],[0,22]],'#8ffaff','#e2ffff');poly([[-8,0],[0,-13],[8,0],[0,13]],'#2f9ea9')}
      else if(kind==='chest'){ctx.fillStyle='#50321f';ctx.fillRect(-20,-12,40,26);ctx.fillStyle='#80532e';ctx.fillRect(-18,-11,36,10);ctx.fillStyle='#a87942';ctx.fillRect(-18,1,36,11);ctx.fillStyle='#d2ad68';ctx.fillRect(-3,-8,6,16);ctx.fillStyle='#26373c';ctx.fillRect(-20,0,40,3)}
      else if(kind==='sensor'){ctx.fillStyle='#142a30';ctx.fillRect(-17,-11,34,22);ctx.fillStyle='#1e5557';ctx.fillRect(-12,-7,24,14);ctx.shadowColor='#55f4e4';ctx.shadowBlur=9;ctx.fillStyle='#6cfff0';ctx.fillRect(-5,-5,10,10);ctx.shadowBlur=0}
      else if(kind==='portal'){ctx.strokeStyle='#8ffaff';ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(0,0,16,25,0,0,Math.PI*2);ctx.stroke();ctx.strokeStyle='#367c83';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,0,9,18,0,0,Math.PI*2);ctx.stroke()}ctx.restore();
    }
    function same(a,b){return !!a&&a.x===b.x&&a.y===b.y}
    function cellObject(x,y){const p={x,y};if(same(warden,p))return 'warden';if(relics.some(r=>!r.found&&same(r,p)))return 'relic';if(chests.some(c=>!c.opened&&same(c,p)))return 'chest';if(sensors.some(s=>!s.triggered&&same(s,p)))return 'sensor';if(same(portal,p))return 'portal';return null}
    function drawScene(){
      if(!ctx||done)return;const w=cssW,h=cssH,cx=w/2,horizon=h*.37;
      const sky=ctx.createLinearGradient(0,0,0,horizon);sky.addColorStop(0,'#050d14');sky.addColorStop(1,'#172d34');ctx.fillStyle=sky;ctx.fillRect(0,0,w,horizon);
      const floor=ctx.createLinearGradient(0,horizon,0,h);floor.addColorStop(0,'#263940');floor.addColorStop(1,'#091318');ctx.fillStyle=floor;ctx.fillRect(0,horizon,w,h-horizon);
      blockTexture([[0,0],[w,0],[cx+w*.08,horizon],[cx-w*.08,horizon]],'polished',3,26);
      const f=DIRS[facing],left=[-f[1],f[0]],right=[f[1],-f[0]],bounds=d=>{const half=w*(.36/(d+.55)),tall=h*(.53/(d+1.05));return {l:cx-half,r:cx+half,t:horizon-tall,b:horizon+tall}};
      for(let d=4;d>=1;d--){
        const p={x:pos.x+f[0]*d,y:pos.y+f[1]*d},near=bounds(d-1),far=bounds(d),lp={x:p.x+left[0],y:p.y+left[1]},rp={x:p.x+right[0],y:p.y+right[1]};
        blockTexture([[near.l,near.b],[near.r,near.b],[far.r,far.b],[far.l,far.b]],'cobbled',d+11,Math.max(10,23-d*2));
        ctx.strokeStyle='#101e24';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(near.l,near.b);ctx.lineTo(far.l,far.b);ctx.moveTo(near.r,near.b);ctx.lineTo(far.r,far.b);ctx.stroke();
        const leftOpen=!!(map[lp.y]&&map[lp.y][lp.x]===0),rightOpen=!!(map[rp.y]&&map[rp.y][rp.x]===0),leftPts=[[near.l,near.t],[far.l,far.t],[far.l,far.b],[near.l,near.b]],rightPts=[[near.r,near.t],[far.r,far.t],[far.r,far.b],[near.r,near.b]];
        blockTexture(leftPts,leftOpen?'polished':'bricks',d+2,Math.max(10,24-d*2));blockTexture(rightPts,rightOpen?'polished':'bricks',d+7,Math.max(10,24-d*2));
        if(leftOpen){poly([[near.l+(near.r-near.l)*.08,near.t+(near.b-near.t)*.22],[far.l+(far.r-far.l)*.08,far.t+(far.b-far.t)*.22],[far.l+(far.r-far.l)*.08,far.b-(far.b-far.t)*.16],[near.l+(near.r-near.l)*.08,near.b-(near.b-near.t)*.16]],'#030b10','#315154');ctx.fillStyle='#1b7775';ctx.fillRect(near.l+5,near.b-18,4,3)}
        if(rightOpen){poly([[near.r-(near.r-near.l)*.08,near.t+(near.b-near.t)*.22],[far.r-(far.r-far.l)*.08,far.t+(far.b-far.t)*.22],[far.r-(far.r-far.l)*.08,far.b-(far.b-far.t)*.16],[near.r-(near.r-near.l)*.08,near.b-(near.b-near.t)*.16]],'#030b10','#315154');ctx.fillStyle='#1b7775';ctx.fillRect(near.r-9,near.b-18,4,3)}
        if(!map[p.y]||map[p.y][p.x]===1){const frontPts=[[far.l,far.t],[far.r,far.t],[far.r,far.b],[far.l,far.b]];blockTexture(frontPts,'bricks',d+19,Math.max(8,19-d*2));const fw=far.r-far.l,fh=far.b-far.t;if(fw>35&&fh>35)blockTexture([[cx-fw*.16,far.t+fh*.25],[cx+fw*.16,far.t+fh*.25],[cx+fw*.16,far.t+fh*.72],[cx-fw*.16,far.t+fh*.72]],'chiseled',d+4,Math.max(7,12-d));break}
        const obj=cellObject(p.x,p.y);if(obj){const scale=obj==='warden'?clamp(1.55/(d*.62),.28,1.22):clamp(.9/(d*.48),.16,.75);drawObject(obj,cx,far.b-(far.b-far.t)*.40,scale)}
        if(wool.some(v=>same(v,p))){ctx.fillStyle='#d5ddd0';ctx.fillRect(far.l+(far.r-far.l)*.3,far.b-5,Math.max(2,(far.r-far.l)*.4),4);ctx.fillStyle='#9caea5';ctx.fillRect(far.l+(far.r-far.l)*.34,far.b-7,Math.max(2,(far.r-far.l)*.28),2)}
        if((d+pos.x+pos.y)%3===0){ctx.fillStyle='#123e43';ctx.fillRect(far.l+4,far.b-13,Math.max(3,(far.r-far.l)*.16),8);ctx.fillStyle='#2a8e87';ctx.fillRect(far.l+7,far.b-12,3,3);ctx.fillStyle='rgba(93,255,227,.7)';ctx.fillRect(far.l+10,far.b-10,2,2)}
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