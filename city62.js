/* Варденяшка 7.3 — real WebGL voxel Ancient City and a fully 3D Warden. */
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
    #v5out .city70-canvas{display:block;width:100%;height:100%;image-rendering:auto;touch-action:none}
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
    const relics=reachable.splice(0,required).map(p=>({...p,found:false})),chestCount=difficulty==='easy'?3:difficulty==='hard'?5:4,chests=reachable.splice(0,chestCount).map(p=>({...p,opened:false})),sensorCount=difficulty==='easy'?3:difficulty==='hard'?7:5,sensors=reachable.splice(0,sensorCount).map(p=>({...p,triggered:false})),woolCount=difficulty==='hard'?2:3,wool=reachable.splice(0,woolCount),spawnDistances=distanceMap(map,start);reachable.sort((a,b)=>(spawnDistances.get(b.x+','+b.y)||0)-(spawnDistances.get(a.x+','+a.y)||0));const wardenSpawn={...(reachable.shift()||{x:size-2,y:size-2})};let warden={...wardenSpawn};
    const stats=readStats();stats.runs++;saveStats(stats);let moves=0,health=maxHealth,lantern=difficulty==='hard'?2:3,noise=0,wardenAwake=false,wardenStun=0,wardenStep=0,done=false,crouching=false,mapOpen=false;
    const wrap=document.createElement('div');wrap.className='city70-wrap';out.append(wrap);
    const hudBox=document.createElement('div');hudBox.className='city70-hud';wrap.append(hudBox);
    const view=document.createElement('div');view.className='city70-view';wrap.append(view);
    const canvas=document.createElement('canvas');canvas.className='city70-canvas';canvas.setAttribute('aria-label','Трёхмерный вид от первого лица: коридоры Древнего города');view.append(canvas);
    const label=document.createElement('div');label.className='city70-view-label';label.textContent='🎮 3D · WebGL · ДРЕВНИЙ ГОРОД';view.append(label);
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
    const gl=canvas.getContext('webgl',{alpha:false,antialias:true,depth:true,stencil:false,powerPreference:'low-power'})||canvas.getContext('experimental-webgl',{alpha:false,antialias:true,depth:true,stencil:false});
    let glProgram=null,glBuffer=null,atlasTexture=null,glReady=false;
    label.textContent='🎮 3D · WebGL · ДРЕВНИЙ ГОРОД';
    function compileShader(type,source){
      const sh=gl.createShader(type);gl.shaderSource(sh,source);gl.compileShader(sh);
      if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS)){const message=gl.getShaderInfoLog(sh);gl.deleteShader(sh);throw new Error(message||'Shader compile failed')}
      return sh;
    }
    function makeAtlas(){
      // Eight 64x64 nearest-neighbour pixel-art tiles.
      const T=64,atlas=document.createElement('canvas');atlas.width=T*8;atlas.height=T;
      const c=atlas.getContext('2d');c.imageSmoothingEnabled=false;
      const px=(tile,x,y,color)=>{if(x<0||x>=T||y<0||y>=T)return;c.fillStyle=color;c.fillRect(tile*T+x,y,1,1)};
      const rect=(tile,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(tile*T+x,y,w,h)};
      const noise=(tile,base,colors,seed,rate)=>{
        rect(tile,0,0,T,T,base);
        for(let y=0;y<T;y++)for(let x=0;x<T;x++){
          const n=(x*37+y*19+x*y*11+seed)%rate;
          if(n<colors.length)px(tile,x,y,colors[n]);
        }
      };
      // 0: deep-slate bricks, with 16-pixel staggered blocks and crisp mortar.
      rect(0,0,0,T,T,'#202c32');
      for(let row=0;row<8;row++){
        const y=row*8,offset=row%2?0:8;
        rect(0,0,y,T,2,'#111b21');
        for(let col=-1;col<5;col++){
          const x=col*16+offset;
          if(x>=T||x+15<0)continue;
          rect(0,x,y+2,15,5,['#35464d','#2d3e45','#3a4a50','#293940'][row%4]);
          rect(0,x+1,y+2,11,1,'#40535a');
          rect(0,x,y+6,15,1,'#1b292f');
          rect(0,x+12,y+3,2,1,'#26363d');
          px(0,x+14,y+2,'#465960');
        }
      }
      // Fine chips and mineral flecks in the brick faces.
      for(let i=0;i<70;i++){
        const x=(i*17+5)%64,y=(i*29+7)%64;
        px(0,x,y,i%3===0?'#53656b':i%3===1?'#263940':'#31434a');
      }
      // 1: polished deepslate, smoother broad patches with fine 64px grain.
      noise(1,'#303f46',['#35474e','#293940','#40545b','#2c3c43','#34464c'],23,89);
      for(let i=0;i<28;i++){
        const x=(i*19+3)%58,y=(i*31+5)%58;
        rect(1,x,y,2+(i%4),1+(i%2),i%3===0?'#53656b':i%3===1?'#3d5057':'#26373e');
      }
      rect(1,7,10,20,2,'#3c5057');rect(1,9,12,13,1,'#35474e');
      rect(1,38,45,17,2,'#26373e');rect(1,40,47,10,1,'#40545b');
      // 2: chiseled deepslate with a layered square relief.
      rect(2,0,0,T,T,'#1b292f');rect(2,2,2,60,60,'#34464d');rect(2,4,4,56,56,'#2b3c43');
      rect(2,6,6,52,3,'#4b5e65');rect(2,6,9,3,46,'#40545b');
      rect(2,9,55,46,3,'#18262c');rect(2,55,9,3,46,'#17252b');
      rect(2,14,15,36,34,'#26383f');rect(2,17,18,30,28,'#30434a');
      rect(2,21,22,22,20,'#293b42');rect(2,24,25,16,14,'#24353c');
      rect(2,28,29,8,6,'#3c5056');
      for(let i=0;i<16;i++){px(2,14+i*2,16+(i%4),'#465a61');px(2,13+(i*7)%38,48+(i%3),'#1c2c32')}
      // 3: sculk, branching teal veins and luminous cyan growth.
      noise(3,'#09272d',['#103a40','#16484b','#0d3137','#0b3036','#124047','#0b222a'],31,79);
      const veins=[[5,7],[7,9],[9,11],[11,13],[13,15],[15,17],[17,19],[19,21],[21,23],[23,25],[25,27],[27,29],[29,31],[31,33],[33,35],[35,37],[37,39],[39,41],[41,43],[43,45],[45,47],[47,49],[49,51],[51,53],[53,55],[55,57],[57,59],[59,61],[57,7],[55,9],[53,11],[51,13],[49,15],[47,17],[45,19],[43,21],[41,23],[39,25],[37,27],[35,29],[33,31],[31,33],[29,35],[27,37],[25,39],[23,41],[21,43],[19,45],[17,47],[15,49],[13,51],[11,53],[9,55],[7,57]];
      for(const [x,y] of veins){px(3,x,y,'#17615e');if(x+1<64)px(3,x+1,y,'#124a4a')}
      for(const [x,y] of [[8,10],[16,18],[24,26],[32,34],[40,42],[48,50],[56,58],[56,10],[48,18],[40,26],[32,34],[24,42],[16,50],[8,58],[12,31],[51,33]]){
        rect(3,x,y,3,3,'#238b83');px(3,x,y,'#79e8d7');px(3,x+1,y+1,'#15534f');
      }
      // 4: Warden's muted turquoise hide and crown/horn accents.
      noise(4,'#244b49',['#1b3e40','#2b5652','#315d57','#17373a','#3b6960','#204744','#142f34'],37,83);
      for(const [x,y] of [[5,8],[7,9],[9,11],[11,13],[13,14],[15,16],[17,18],[19,20],[21,22],[23,24],[25,26],[27,28],[47,6],[49,8],[51,10],[53,12],[55,14],[57,16],[43,50],[45,52],[47,54],[49,56],[51,58],[9,46],[11,48],[13,50],[15,52],[17,54],[19,56]]){
        px(4,x,y,'#102c32');if(x<63)px(4,x+1,y,'#193a3b');
      }
      for(const [x,y] of [[12,8],[14,10],[40,10],[42,12],[8,34],[10,36],[52,34],[54,36],[28,50],[30,52],[38,22],[40,24],[18,30],[46,44]]){
        rect(4,x,y,2,2,'#47766a');
      }
      for(const [x,y] of [[4,26],[58,28],[22,58],[40,4],[32,36],[16,26],[48,18],[8,44]])px(4,x,y,'#5b8574');
      // 5: bright cyan soul core, with a sharp layered centre.
      rect(5,0,0,T,T,'#0b252d');rect(5,5,5,54,54,'#123943');rect(5,9,9,46,46,'#0b2b34');
      rect(5,20,13,24,38,'#155b61');rect(5,22,15,20,34,'#218b89');
      rect(5,26,17,12,30,'#4bc9bd');rect(5,29,19,6,26,'#8bf5e7');
      rect(5,24,15,16,3,'#68e2d3');rect(5,24,46,16,3,'#176c70');
      rect(5,17,23,4,18,'#176c70');rect(5,43,23,4,18,'#176c70');
      for(let i=0;i<12;i++){px(5,14+i*3,10+(i%3),'#69e4d6');px(5,13+(i*7)%38,51+(i%4),'#176c70')}
      // 6: pale muted sage-grey rib plates, layered like the original Warden.
      noise(6,'#788879',['#8e9883','#9da18a','#657b78','#526b6c','#a5a58c','#71847c'],11,61);
      for(let y=4;y<64;y+=10){
        rect(6,3,y,58,2,'#4e6668');rect(6,5,y+2,54,4,'#929984');
        rect(6,7,y+6,50,2,'#667a75');rect(6,9,y+3,46,1,'#b0ae91');
      }
      for(const [x,y] of [[10,8],[18,18],[28,6],[42,14],[52,26],[14,42],[36,50],[50,54],[24,32],[58,8],[6,56],[44,38],[30,58]]){
        rect(6,x,y,2,2,'#b0ae91');
      }
      // 7: deep blue-black hide for the body, contrasting with turquoise horns and pale ribs.
      noise(7,'#101923',['#14232e','#0b151e','#182b36','#0e1d28','#1c3039','#101b25','#203540'],29,73);
      for(const [x,y] of [[6,8],[8,10],[10,12],[12,14],[14,16],[16,18],[18,20],[20,22],[22,24],[24,26],[26,28],[28,30],[48,6],[50,8],[52,10],[54,12],[56,14],[58,16],[16,48],[18,50],[20,52],[22,54],[24,56],[26,58],[42,46],[44,48],[46,50]]){
        px(7,x,y,'#263e47');if(x<63)px(7,x+1,y,'#152631');
      }
      for(const [x,y] of [[12,28],[14,30],[16,32],[48,30],[50,32],[52,34],[24,44],[26,46],[38,12],[40,14],[32,56]]){
        px(7,x,y,'#203d45');
      }
      return atlas;
    }
    function initGL(){
      if(!gl)return false;
      const vs='attribute vec3 aPosition;attribute vec2 aUV;attribute vec3 aTint;uniform mat4 uViewProjection;uniform vec3 uCamera;varying vec2 vUV;varying vec3 vTint;varying float vDepth;void main(){gl_Position=uViewProjection*vec4(aPosition,1.0);vUV=aUV;vTint=aTint;vDepth=length(aPosition-uCamera);}';
      const fs='precision mediump float;uniform sampler2D uAtlas;uniform vec3 uFogColor;varying vec2 vUV;varying vec3 vTint;varying float vDepth;void main(){vec3 tex=texture2D(uAtlas,vUV).rgb;vec3 lit=tex*vTint;float fog=smoothstep(12.0,34.0,vDepth);gl_FragColor=vec4(mix(lit,uFogColor,fog),1.0);}';
      try{
        const v=compileShader(gl.VERTEX_SHADER,vs),f=compileShader(gl.FRAGMENT_SHADER,fs);glProgram=gl.createProgram();gl.attachShader(glProgram,v);gl.attachShader(glProgram,f);gl.linkProgram(glProgram);
        if(!gl.getProgramParameter(glProgram,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(glProgram)||'Program link failed');
        gl.deleteShader(v);gl.deleteShader(f);glBuffer=gl.createBuffer();atlasTexture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,atlasTexture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,makeAtlas());
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
        gl.useProgram(glProgram);gl.uniform1i(gl.getUniformLocation(glProgram,'uAtlas'),0);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);glReady=true;return true;
      }catch(err){label.textContent='⚠️ Ошибка 3D-графики';setTimeout(()=>{if(!done)setLog('Не удалось запустить WebGL: '+err.message)},0);return false}
    }
    function matPerspective(fovy,aspect,near,far){const f=1/Math.tan(fovy/2),nf=1/(near-far),o=new Float32Array(16);o[0]=f/aspect;o[5]=f;o[10]=(far+near)*nf;o[11]=-1;o[14]=2*far*near*nf;return o}
    function matLookAt(eye,center,up){
      let zx=eye[0]-center[0],zy=eye[1]-center[1],zz=eye[2]-center[2],n=Math.hypot(zx,zy,zz)||1;zx/=n;zy/=n;zz/=n;
      let xx=up[1]*zz-up[2]*zy,xy=up[2]*zx-up[0]*zz,xz=up[0]*zy-up[1]*zx;n=Math.hypot(xx,xy,xz)||1;xx/=n;xy/=n;xz/=n;
      const yx=zy*xz-zz*xy,yy=zz*xx-zx*xz,yz=zx*xy-zy*xx,o=new Float32Array(16);
      o[0]=xx;o[1]=yx;o[2]=zx;o[3]=0;o[4]=xy;o[5]=yy;o[6]=zy;o[7]=0;o[8]=xz;o[9]=yz;o[10]=zz;o[11]=0;
      o[12]=-(xx*eye[0]+xy*eye[1]+xz*eye[2]);o[13]=-(yx*eye[0]+yy*eye[1]+yz*eye[2]);o[14]=-(zx*eye[0]+zy*eye[1]+zz*eye[2]);o[15]=1;return o;
    }
    function matMultiply(a,b){const o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)o[c*4+r]=a[r]*b[c*4]+a[4+r]*b[c*4+1]+a[8+r]*b[c*4+2]+a[12+r]*b[c*4+3];return o}
    function resize(){const r=view.getBoundingClientRect();cssW=Math.max(280,Math.floor(r.width||360));cssH=Math.max(250,Math.floor(r.height||300));dpr=Math.min(2,Math.max(1,window.devicePixelRatio||1));canvas.width=Math.floor(cssW*dpr);canvas.height=Math.floor(cssH*dpr);canvas.style.width='100%';canvas.style.height='100%';if(glReady){gl.viewport(0,0,canvas.width,canvas.height);drawScene()}}
    function addCube(out,cx,cy,cz,sx,sy,sz,type,tint,yaw,rz){
      const tile=Number.isInteger(type)&&type>=0&&type<=7?type:0,u0=(tile*64+.5)/512,u1=((tile+1)*64-.5)/512,v0=.5/64,v1=63.5/64;
      const faces=[{p:[[-.5,-.5,-.5],[.5,-.5,-.5],[.5,.5,-.5],[-.5,.5,-.5]],l:.88},{p:[[.5,-.5,.5],[-.5,-.5,.5],[-.5,.5,.5],[.5,.5,.5]],l:.68},{p:[[-.5,.5,-.5],[.5,.5,-.5],[.5,.5,.5],[-.5,.5,.5]],l:1.18},{p:[[-.5,-.5,.5],[.5,-.5,.5],[.5,-.5,-.5],[-.5,-.5,-.5]],l:.48},{p:[[-.5,-.5,.5],[-.5,-.5,-.5],[-.5,.5,-.5],[-.5,.5,.5]],l:.76},{p:[[.5,-.5,-.5],[.5,-.5,.5],[.5,.5,.5],[.5,.5,-.5]],l:.98}],uv=[[u0,v0],[u1,v0],[u1,v1],[u0,v1]],order=[0,1,2,0,2,3],co=Math.cos(yaw||0),si=Math.sin(yaw||0),cr=Math.cos(rz||0),sr=Math.sin(rz||0),base=tint||[1,1,1];
      for(const face of faces)for(const idx of order){const p=face.p[idx];let x=p[0]*sx,y=p[1]*sy,z=p[2]*sz;const rx=x*cr-y*sr,ry=x*sr+y*cr,wx=cx+rx*co+z*si,wz=cz-rx*si+z*co,t=uv[idx];out.push(wx,cy+ry,wz,t[0],t[1],base[0]*face.l,base[1]*face.l,base[2]*face.l)}
    }
    function drawWarden3D(add,x,z){
      const yaw=Math.atan2(pos.x*2+1-x,-(pos.y*2+1-z));
      const part=(lx,y,lz,sx,sy,sz,type,tint,rz)=>{const wx=x+lx*Math.cos(yaw)+lz*Math.sin(yaw),wz=z-lx*Math.sin(yaw)+lz*Math.cos(yaw);add(wx,y,wz,sx,sy,sz,type,tint,yaw,rz||0)};
      const dark=[1,1,1],teal=[1.08,1.12,1.04],rib=[1,1,1],sculk=[.65,.92,.9],cyan=wardenAwake?[.72,1,1]:[.22,.58,.58];
      const breathe=Math.sin(Date.now()/(wardenAwake?270:950))*(wardenAwake?.018:.008);
      if(!wardenAwake){
        part(0,.28,0,1.08,.34,.68,7,dark);
        part(0,.42,-.08,.78,.34,.55,7,dark);
        part(.52,.48,-.02,.42,.25,.42,7,dark,-.12);
        part(-.52,.48,-.02,.42,.25,.42,7,dark,.12);
        part(0,.47,-.37,.22,.25,.035,5,cyan);
        return;
      }
      // Deep blue-black body, teal crown and horns, pale rib-like plates.
      // Short sturdy legs and blocky feet.
      part(-.29,.48,.015,.43,.86,.58,7,dark);
      part(.29,.48,.015,.43,.86,.58,7,dark);
      part(-.29,.09,-.10,.48,.18,.72,7,dark);
      part(.29,.09,-.10,.48,.18,.72,7,dark);
      // Muted pale ankle markings.
      part(-.29,.22,-.405,.29,.085,.035,6,rib);
      part(.29,.22,-.405,.29,.085,.035,6,rib);
      // Main torso and broad shoulders.
      part(0,1.38+breathe,0,1.16,1.28,.72,7,dark);
      // Long rectangular arms with the characteristic light outer rib panels.
      part(-.76,1.27,0,.38,1.34,.58,7,dark,-.025);
      part(.76,1.27,0,.38,1.34,.58,7,dark,.025);
      part(-.77,.52,-.04,.4,.36,.54,7,dark);
      part(.77,.52,-.04,.4,.36,.54,7,dark);
      part(-.76,1.22,-.302,.245,.83,.045,6,rib,-.035);
      part(.76,1.22,-.302,.245,.83,.045,6,rib,.035);
      // Square dark head with a teal pixelated crown.
      part(0,2.34+breathe,0,.88,.78,.7,7,dark);
      part(0,2.744+breathe,0,.9,.045,.72,4,teal);
      part(-.19,2.37+breathe,-.365,.12,.075,.035,3,[.48,1,1]);
      part(.19,2.37+breathe,-.365,.12,.075,.035,3,[.48,1,1]);
      // Broad, stepped turquoise horns.
      part(-.43,2.63,.015,.23,.34,.28,4,teal,-.16);
      part(-.58,2.79,.015,.22,.34,.26,4,teal,-.38);
      part(-.73,2.91,.015,.2,.22,.24,4,teal,-.58);
      part(.43,2.63,.015,.23,.34,.28,4,teal,.16);
      part(.58,2.79,.015,.22,.34,.26,4,teal,.38);
      part(.73,2.91,.015,.2,.22,.24,4,teal,.58);
      // Three pairs of pale rib plates around the cyan soul core.
      for(let i=0;i<3;i++){
        const yy=1.08+i*.2;
        part(-.285,yy,-.382,.36,.075,.045,6,rib,-.13);
        part(.285,yy,-.382,.36,.075,.045,6,rib,.13);
      }
      part(0,1.39+breathe,-.415,.23,.3,.06,5,cyan);
      part(0,1.4+breathe,-.452,.09,.16,.025,3,[.78,1,1]);
    }
    function buildWorld(){
      const verts=[],add=(...a)=>addCube(verts,...a),worldX=x=>x*2+1,worldZ=y=>y*2+1;
      // Each maze cell becomes a 2x2 Minecraft-style block bay, so corridors have room to read as spaces.
      for(let y=0;y<size;y++)for(let x=0;x<size;x++){
        const cx=worldX(x),cz=worldZ(y);
        // Tile floors and ceilings as individual one-metre blocks so 64x64 pixels never stretch across a large slab.
        for(let by=0;by<2;by++)for(let bx=0;bx<2;bx++){
          const tx=cx+(bx-.5),tz=cz+(by-.5);
          add(tx,-.075,tz,1,.15,1,(x+y+bx+by)%4===0?2:1,[.76,.82,.83],0,0);
        }
        if(map[y][x]===1){
          // A wall cell is a 2x3x2 arrangement of real 1x1x1 blocks.
          // Each block gets its own complete 64x64 texture instead of stretching one tile over a 2x2x2.86 cube.
          for(let by=0;by<3;by++)for(let bz=0;bz<2;bz++)for(let bx=0;bx<2;bx++){
            const tx=cx+(bx-.5),tz=cz+(bz-.5),variant=(x*7+y*11+bx*3+bz+by)%9;
            const material=variant===0?2:variant===4?1:0;
            const shade=variant===1?.86:variant===6?.94:1;
            add(tx,.5+by,tz,1,1,1,material,[shade,shade,shade],0,0);
          }
          for(let bz=0;bz<2;bz++)for(let bx=0;bx<2;bx++){
            add(cx+(bx-.5),3.0,cz+(bz-.5),1,.12,1,2,[.72,.8,.82],0,0);
          }
        }else{
          for(let bz=0;bz<2;bz++)for(let bx=0;bx<2;bx++){
            add(cx+(bx-.5),3.0,cz+(bz-.5),1,.12,1,2,[.42,.52,.55],0,0);
          }
          // Deepslate floor seams and sculk patches add scale and depth without blocking movement.
          if((x*13+y*7)%7===0)add(cx,.012,cz,.62,.025,.62,3,[.75,1,1],0,0);
          if((x+y*3)%5===0){
            add(cx-.76,.22,cz,.12,.44,.12,2,[.55,.68,.7],0,0);
            add(cx+.76,.22,cz,.12,.44,.12,2,[.55,.68,.7],0,0);
          }
          if((x*5+y*11)%9===0)add(cx,.34,cz-.78,.42,.68,.08,3,[.3,.72,.72],0,0);
        }
      }
      // Small projecting deepslate ribs make wall faces look like built Minecraft architecture.
      for(let y=0;y<size;y++)for(let x=0;x<size;x++)if(map[y][x]===1){
        const cx=worldX(x),cz=worldZ(y);
        if((x+y)%3===0){
          add(cx-.82,.92,cz-.98,.18,1.84,.12,2,[.68,.78,.8],0,0);
          add(cx+.82,.92,cz-.98,.18,1.84,.12,2,[.68,.78,.8],0,0);
        }
      }
      for(const r of relics)if(!r.found){const x=worldX(r.x),z=worldZ(r.y);add(x,.38,z,.34,.48,.28,3,[.42,1,1],0,0);add(x,.68,z,.2,.28,.2,3,[.85,1,1],0,.12)}
      for(const ch of chests)if(!ch.opened){const x=worldX(ch.x),z=worldZ(ch.y);add(x,.22,z,.82,.42,.72,0,[.9,.62,.3],0,0);add(x,.47,z-.01,.82,.13,.72,0,[1,.72,.38],0,0);add(x,.3,z-.37,.12,.12,.04,2,[1,.9,.6],0,0)}
      for(const sensor of sensors)if(!sensor.triggered){const x=worldX(sensor.x),z=worldZ(sensor.y);add(x,.13,z,.58,.26,.58,3,[.45,1,1],0,0);add(x,.29,z,.22,.08,.22,3,[.8,1,1],0,0)}
      const px=worldX(portal.x),pz=worldZ(portal.y);
      add(px-.78,.9,pz,.18,1.8,.24,2,[.48,.82,.85],0,0);add(px+.78,.9,pz,.18,1.8,.24,2,[.48,.82,.85],0,0);add(px,1.78,pz,1.72,.16,.24,3,[.25,.85,.86],0,0);
      if(!same(warden,pos)||wardenAwake)drawWarden3D(add,worldX(warden.x),worldZ(warden.y));
      return new Float32Array(verts);
    }
    function drawScene(){
      if(!glReady||done)return;const verts=buildWorld(),yaw=facing*Math.PI/2,eye=[pos.x*2+1,1.57,pos.y*2+1],target=[eye[0]+Math.sin(yaw),1.57,eye[2]-Math.cos(yaw)];
      const projection=matPerspective(Math.PI/2.45,canvas.width/canvas.height,.06,55),viewMatrix=matLookAt(eye,target,[0,1,0]),vp=matMultiply(projection,viewMatrix);
      gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(.012,.03,.043,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(glProgram);gl.bindBuffer(gl.ARRAY_BUFFER,glBuffer);gl.bufferData(gl.ARRAY_BUFFER,verts,gl.DYNAMIC_DRAW);
      const stride=32,position=gl.getAttribLocation(glProgram,'aPosition'),uv=gl.getAttribLocation(glProgram,'aUV'),tint=gl.getAttribLocation(glProgram,'aTint');
      gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,3,gl.FLOAT,false,stride,0);gl.enableVertexAttribArray(uv);gl.vertexAttribPointer(uv,2,gl.FLOAT,false,stride,12);gl.enableVertexAttribArray(tint);gl.vertexAttribPointer(tint,3,gl.FLOAT,false,stride,20);
      gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,atlasTexture);gl.uniformMatrix4fv(gl.getUniformLocation(glProgram,'uViewProjection'),false,vp);gl.uniform3f(gl.getUniformLocation(glProgram,'uCamera'),eye[0],eye[1],eye[2]);gl.uniform3f(gl.getUniformLocation(glProgram,'uFogColor'),.018,.055,.065);gl.drawArrays(gl.TRIANGLES,0,verts.length/8);
      label.textContent=wardenAwake&&wardenStun===0?'👁️ СТРАЖ СЛЫШИТ ТЕБЯ · 3D':'🎮 3D · ДРЕВНИЙ ГОРОД';
    }
    if(!initGL())label.textContent='⚠️ WebGL не поддерживается этим браузером';
    function same(a,b){return !!a&&a.x===b.x&&a.y===b.y}
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