import {coverageLabel} from './coverage.js?v=batch11-14'
/** A static Earth texture projected analytically onto a sphere; no tiles or GIS service. */
const DEG = Math.PI / 180;
const BASE = { lon: 44, lat: 23, scale: 1 };
const asset = name => new URL('./globe-' + name, import.meta.url).href;
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const wrap = value => ((value + 540) % 360 + 360) % 360 - 180;

const fragment = `
precision highp float;
uniform vec2 size, angle;
uniform float radius;
uniform vec3 backdrop;
uniform sampler2D relief;
const float pi=3.141592653589793;
void main(){
  vec2 p=(gl_FragCoord.xy-size*.5)/radius;
  float d=length(p);
  if(d>1.0){
    float halo=exp(-90.0*(d-1.0));
    gl_FragColor=vec4(mix(backdrop,vec3(.35,.72,.71),.44*halo),1.);
    return;
  }
  float z=sqrt(max(0.0,1.0-dot(p,p)));
  float lat=asin(clamp(p.y*cos(angle.y)+z*sin(angle.y),-1.,1.));
  float lon=angle.x+atan(p.x,z*cos(angle.y)-p.y*sin(angle.y));
  vec3 map=texture2D(relief,vec2(fract(.5+lon/(2.*pi)),.5-lat/pi)).rgb;
  // Geographic graticule at fifteen degrees with a wider line for the equator.
  vec2 grid=abs(fract(vec2(lon,lat)*12./pi+.5)-.5);
  float spacing=max(1.6/radius,.01);
  float ink=1.-smoothstep(0.,spacing,min(grid.x*cos(lat),grid.y));
  map=mix(map,vec3(.72,.87,.82),ink*.24);
  float diffuse=dot(normalize(vec3(-.55,.68,.8)),vec3(p,z));
  float light=.61+.45*max(diffuse,0.);
  vec3 color=map*light+vec3(.13,.32,.33)*pow(1.-z,4.);
  color=mix(color,vec3(.64,.85,.81),(1.-smoothstep(0.,1.6/radius,1.-d))*.63);
  gl_FragColor=vec4(color,1.);
}`;

function earthRenderer(canvas) {
  const gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'low-power' });
  if (!gl) throw Error('WebGL unavailable');
  const shader = (type, source) => {
    const result = gl.createShader(type);
    gl.shaderSource(result, source);
    gl.compileShader(result);
    if (!gl.getShaderParameter(result, gl.COMPILE_STATUS)) throw Error(gl.getShaderInfoLog(result));
    return result;
  };
  const vertex = shader(gl.VERTEX_SHADER, 'attribute vec2 xy; void main(){gl_Position=vec4(xy,0.,1.);}');
  const pixel = shader(gl.FRAGMENT_SHADER, fragment);
  const program = gl.createProgram();
  gl.attachShader(program, vertex);
  gl.attachShader(program, pixel);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw Error(gl.getProgramInfoLog(program));
  gl.useProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(pixel);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,3,-1,-1,3]), gl.STATIC_DRAW);
  const attr = gl.getAttribLocation(program, 'xy');
  gl.enableVertexAttribArray(attr);
  gl.vertexAttribPointer(attr, 2, gl.FLOAT, false, 0, 0);
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,1,1,0,gl.RGB,gl.UNSIGNED_BYTE,new Uint8Array([28,64,72]));
  const uniforms = Object.fromEntries(['size','angle','radius','backdrop'].map(n => [n,gl.getUniformLocation(program,n)]));
  return {
    texture(img) {
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,img);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
    },
    paint(w,h,r,lon,lat,background) {
      gl.viewport(0,0,w,h);
      gl.uniform2f(uniforms.size,w,h);
      gl.uniform2f(uniforms.angle,lon*DEG,lat*DEG);
      gl.uniform1f(uniforms.radius,r);
      gl.uniform3fv(uniforms.backdrop, background);
      gl.drawArrays(gl.TRIANGLES,0,3);
    },
    dispose() {
      gl.deleteTexture(texture); gl.deleteBuffer(buffer); gl.deleteProgram(program);
    }
  };
}

function button(label, handler) {
  const el = document.createElement('button');
  el.type = 'button'; el.textContent = label;
  el.style.cssText = 'min-height:44px;padding:6px 12px;border:1px solid #456167;border-radius:5px;background:var(--card);color:var(--text);cursor:pointer;font:inherit;text-align:left';
  el.addEventListener('click', handler);
  return el;
}

function loadImage(url) {
  return new Promise((resolve,reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function centerCoordinates(sx,sy,view) {
  const z = Math.sqrt(Math.max(0,1-sx*sx-sy*sy));
  const lat = view.lat*DEG;
  return {
    lon: wrap(view.lon + Math.atan2(sx,z*Math.cos(lat)-sy*Math.sin(lat))/DEG),
    lat: Math.asin(clamp(sy*Math.cos(lat)+z*Math.sin(lat),-1,1))/DEG
  };
}

/** The host supplies accessible region navigation plus zoom/reset buttons. */
export function mountGlobe(container, geography, onSelect) {
  const view = {...BASE};
  const layer = document.createElement('div');
  layer.style.cssText = 'position:absolute;inset:0;isolation:isolate;color:#eff8ef;overflow:hidden;font:14px system-ui,sans-serif';
  container.append(layer);
  const canvas = document.createElement('canvas');
  const overlay = document.createElement('canvas');
  for (const c of [canvas,overlay]) {
    c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block';
    layer.append(c);
  }
  overlay.setAttribute('aria-label','Interactive globe. Arrow keys rotate, plus and minus zoom, Home resets. Choose a region in the accessible region list.');
  overlay.setAttribute('role','group'); overlay.tabIndex=0;
  overlay.style.touchAction='none'; overlay.style.cursor='grab';
  const ctx = overlay.getContext('2d');
  const popup = document.createElement('div');
  popup.setAttribute('role','region'); popup.setAttribute('aria-label','Map selection');
  popup.style.cssText = 'position:absolute;inset:auto 8px 8px;max-height:78%;overflow:auto;max-width:310px;margin:auto;padding:10px;box-sizing:border-box;display:none;gap:5px;background:var(--card);color:var(--text);border:1px solid #618084;border-radius:8px;box-shadow:0 5px 18px #0005';
  layer.append(popup);
  const pointers=new Map();
  let selected=null, renderer, frame=0, flight=null, dead=false, width=0, height=0, radius=1, dpr=1;
  let pins=[], drag=false, hover=null, origin=null, pinch=null, flat=false, pickMap, countries, mapImage;
  const abort = new AbortController();
  const listen=(el,type,fn,extra={})=>el.addEventListener(type,fn,{...extra,signal:abort.signal});
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const close = () => { popup.style.display='none'; popup.replaceChildren(); };
  const choose = id => { close(); onSelect(id); };
  const showChoices = (title,entries=[]) => {
    close();
    const heading=document.createElement('strong'); heading.textContent=title;
    popup.append(heading);
    for(const g of entries) popup.append(button(g.label+' · '+coverageLabel(g),()=>choose(g.id)));
    popup.append(button('Close',()=>{close();overlay.focus();}));
    popup.style.display='grid'; popup.querySelector('button')?.focus({preventScroll:true});
  };
  const enqueue = () => {
    if (!frame && !dead && !document.hidden) frame=requestAnimationFrame(draw);
  };
  let background;
  function refreshTheme(){
    const hex=getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
    background=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255);
    enqueue();
  }
  listen(window,'atlas-theme',refreshTheme);
  refreshTheme();
  const fallback=()=>{
    flat=true; renderer?.dispose();renderer=null; canvas.style.display='none';
    Object.assign(view,{lon:0,lat:0,scale:1});
    overlay.setAttribute('aria-label','Flat world map. Select markers or choose a region from the list.');
    overlay.style.touchAction='none';
    enqueue();
  };
  try {
    if (navigator.connection?.saveData) fallback();
    else renderer=earthRenderer(canvas);
  } catch { fallback(); }
  listen(canvas,'webglcontextlost',e=>{e.preventDefault();fallback();});
  loadImage(asset('relief.jpg')).then(img=>{
    if (dead) return;
    mapImage=img; renderer?.texture(img); enqueue();
  }).catch(()=>{if(!dead)fallback();});
  Promise.all([loadImage(asset('index.png')),fetch(asset('countries.json'),{signal:abort.signal}).then(r=>r.json())]).then(([img,metadata])=>{
    if(dead)return;
    const pick=document.createElement('canvas');
    pick.width=img.width;pick.height=img.height;
    pickMap=pick.getContext('2d',{willReadFrequently:true});
    pickMap.drawImage(img,0,0); countries=metadata;
  }).catch(()=>{ /* Marker navigation remains available. */ });

  function project(g) {
    if (flat) {
      const pixelsPerDegree=width*view.scale/360;
      return {x:width/2+wrap(g.longitude-view.lon)*pixelsPerDegree,y:height/2+(view.lat-g.latitude)*pixelsPerDegree,z:1,g};
    }
    const lon=wrap(g.longitude-view.lon)*DEG, lat=g.latitude*DEG, center=view.lat*DEG;
    const x=Math.cos(lat)*Math.sin(lon);
    const y=Math.sin(lat)*Math.cos(center)-Math.cos(lat)*Math.cos(lon)*Math.sin(center);
    return {x:width/2+radius*x,y:height/2-radius*y,z:Math.sin(lat)*Math.sin(center)+Math.cos(lat)*Math.cos(lon)*Math.cos(center),g};
  }

  function renderPins() {
    pins=geography.map(project).filter(p=>p.z>.025&&p.x>=0&&p.x<=width&&p.y>=0&&p.y<=height);
    const selectedPin=pins.find(p=>p.g.id===selected);
    for(const p of pins){
      const active=p.g.id===selected, gap=!p.g.model_ids.length;
      const color=gap?'#a9deec':'#ffcf7a';
      ctx.beginPath(); ctx.arc(p.x,p.y,active?12:8,0,Math.PI*2);ctx.fillStyle=gap?'#63c5d52e':'#ffe1a329';ctx.fill();
      ctx.beginPath(); ctx.arc(p.x,p.y,active?7:4.8,0,Math.PI*2);
      ctx.fillStyle=gap?'#15343d':color; ctx.fill();ctx.strokeStyle=gap?color:'#533c21';ctx.lineWidth=gap?1.7:1.2;ctx.stroke();
      if(active){ ctx.beginPath();ctx.arc(p.x,p.y,12,0,Math.PI*2);ctx.strokeStyle=color;ctx.lineWidth=1;ctx.stroke(); }
    }
    const boxes=[];
    const priority=[pins.find(p=>p.g.id===hover),selectedPin,...pins.filter(p=>p.z>.22)].filter(Boolean);
    const labeled=new Set();
    for(const p of priority){
      if(labeled.has(p.g.id)||(![selected,hover].includes(p.g.id)&&boxes.length>=(width<420?3:5))) continue;
      labeled.add(p.g.id);
      ctx.font='500 12px system-ui,sans-serif';
      const text=p.g.label+' · '+coverageLabel(p.g), w=Math.ceil(ctx.measureText(text).width)+14,h=22;
      const candidates=[[12,-13],[12,6],[-w-11,-13],[-w-11,6],[8,-35]];
      for(const [dx,dy] of candidates){
        const x=p.x+dx,y=p.y+dy;
        if(x<3||x+w>width-3||y<3||y+h>height-3) continue;
        if(boxes.some(b=>x<b.x+b.w+2&&x+w>b.x-2&&y<b.y+b.h+2&&y+h>b.y-2)) continue;
        if(pins.some(other=>other!==p&&other.x>=x-4&&other.x<=x+w+4&&other.y>=y-4&&other.y<=y+h+4)) continue;
        ctx.fillStyle=p.g.id===selected?'#172d31f5':'#142c30db';
        ctx.beginPath();ctx.roundRect(x,y,w,h,4);ctx.fill();
        ctx.strokeStyle=p.g.id===selected?'#dcba77':'#86aa9d80';ctx.lineWidth=.8;ctx.stroke();
        ctx.fillStyle='#f4f4e9';ctx.fillText(text,x+7,y+15);
        boxes.push({x,y,w,h}); p.box={x,y,w,h};break;
      }
    }
  }

  function draw(now) {
    frame=0; if(dead||document.hidden||!width||!height)return;
    if(flight){
      const t=clamp((now-flight.start)/420,0,1),smooth=t*t*(3-2*t);
      view.scale=flight.scale+smooth*(2.15-flight.scale);view.lon=wrap(flight.lon+smooth*flight.dlon);view.lat=flight.lat+smooth*flight.dlat;
      if(t===1)flight=null;else enqueue();
    }
    radius=Math.min(width,height)*.445*view.scale;
    renderer?.paint(canvas.width,canvas.height,radius*dpr,view.lon,view.lat,background);
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
    if(flat){
      const mapW=width*view.scale, mapH=mapW/2;
      const top=(height-mapH)/2+view.lat*mapW/360;
      const left=(width-mapW)/2-view.lon*mapW/360;
      ctx.fillStyle='#18363d';ctx.fillRect(0,top,width,mapH);
      if(mapImage){
        for(const offset of [-mapW,0,mapW]) ctx.drawImage(mapImage,left+offset,top,mapW,mapH);
      }
    }
    renderPins();
  }
  const resize=()=>{
    width=layer.clientWidth;height=layer.clientHeight;dpr=Math.min(window.devicePixelRatio||1,2);
    for(const el of [canvas,overlay]){el.width=Math.max(1,Math.round(width*dpr));el.height=Math.max(1,Math.round(height*dpr));}
    enqueue();
  };
  const observer=new ResizeObserver(resize);observer.observe(layer);resize();

  function zoom(factor){
    view.scale=clamp(view.scale*factor,flat?1:.7,3);flight=null;close();enqueue();
  }
  function reset(){flight=null;Object.assign(view,flat?{lon:0,lat:0,scale:1}:BASE);close();enqueue();}
  function focus(id){
    const g=geography.find(e=>e.id===id); selected=g?.id??null;close();
    if(g){
      flight=null;
      if(reduced.matches||document.hidden){view.lon=g.longitude;view.lat=g.latitude;view.scale=2.15;}
      else flight={start:performance.now(),scale:view.scale,lon:view.lon,lat:view.lat,dlon:wrap(g.longitude-view.lon),dlat:g.latitude-view.lat};
    }
    enqueue();
  }
  const nearby=(x,y,threshold)=>pins.filter(p=>Math.hypot(x-p.x,y-p.y)<threshold);
  function selectMap(x,y) {
    const exact=pins.find(p=>p.box&&x>=p.box.x&&x<=p.box.x+p.box.w&&y>=p.box.y&&y<=p.box.y+p.box.h);
    if(exact){choose(exact.g.id);return;}
    const hits=nearby(x,y,22);
    if(hits.length===1){choose(hits[0].g.id);return;}
    if(hits.length){showChoices('Choose a nearby tradition',hits.map(p=>p.g));return;}
    let geo;
    if(flat){
      const scale=360/(width*view.scale);
      geo={lon:wrap(view.lon+(x-width/2)*scale),lat:view.lat+(height/2-y)*scale};
      if(Math.abs(geo.lat)>90)return;
    }
    else{
      const sx=(x-width/2)/radius,sy=(height/2-y)/radius;
      if(sx*sx+sy*sy>1)return;
      geo=centerCoordinates(sx,sy,view);
    }
    let country;
    if(pickMap&&Math.abs(geo.lat)<=90) {
      const xx=clamp(Math.floor((180+geo.lon)/360*pickMap.canvas.width),0,pickMap.canvas.width-1);
      const yy=clamp(Math.floor((90-geo.lat)/180*pickMap.canvas.height),0,pickMap.canvas.height-1);
      country=countries[pickMap.getImageData(xx,yy,1,1).data[0]];
    }
    const matched=country?geography.filter(g=>g.country_iso3_for_navigation.includes(country[0])):[];
    if(matched.length===1){choose(matched[0].id);return;}
    // Nearby choices express geographical proximity only.
    const choices=matched.length?matched:geography.filter(g=>{
      const distance=Math.acos(clamp(Math.sin(geo.lat*DEG)*Math.sin(g.latitude*DEG)+Math.cos(geo.lat*DEG)*Math.cos(g.latitude*DEG)*Math.cos((geo.lon-g.longitude)*DEG),-1,1))/DEG;
      return distance<12;
    });
    showChoices(choices.length?'Nearby navigation anchors':'Not yet represented in this dataset',choices);
  }

  const local=e=>{const box=overlay.getBoundingClientRect();return {x:e.clientX-box.left,y:e.clientY-box.top};};
  const distance=()=>{const [a,b]=[...pointers.values()];return Math.hypot(a.x-b.x,a.y-b.y);};
  listen(overlay,'pointerdown',e=>{
    if(e.button!==0)return;
    flight=null;close();const point=local(e);
    pointers.set(e.pointerId,point);overlay.setPointerCapture(e.pointerId);
    if(pointers.size===1){origin=point;drag=false;}
    if(pointers.size===2){pinch={distance:distance(),scale:view.scale};drag=true;}
  });
  listen(overlay,'pointermove',e=>{
    const point=local(e), prev=pointers.get(e.pointerId);
    if(!prev){
      const nearest=nearby(point.x,point.y,12).sort((a,b)=>Math.hypot(a.x-point.x,a.y-point.y)-Math.hypot(b.x-point.x,b.y-point.y))[0];
      const next=nearest?.g.id??null;if(next!==hover){hover=next;enqueue();}
      overlay.style.cursor=next?'pointer':'grab';return;
    }
    pointers.set(e.pointerId,point);
    if(pointers.size===2&&pinch){view.scale=clamp(pinch.scale*distance()/Math.max(1,pinch.distance),flat?1:.7,3);enqueue();return;}
    if(origin&&Math.hypot(point.x-origin.x,point.y-origin.y)>4)drag=true;
    if(!drag)return;
    const degrees=flat?360/(width*view.scale):65/radius;
    view.lon=wrap(view.lon-(point.x-prev.x)*degrees);
    view.lat=clamp(view.lat+(point.y-prev.y)*degrees,-90,90);overlay.style.cursor='grabbing';enqueue();
  });
  function release(e,canceled){
    if(!pointers.has(e.pointerId))return;
    pointers.delete(e.pointerId);
    if(!canceled&&!drag&&!pointers.size){const p=local(e);selectMap(p.x,p.y);}
    if(pointers.size<2)pinch=null;
    overlay.style.cursor='grab';
  }
  listen(overlay,'pointerup',e=>release(e,false));listen(overlay,'pointercancel',e=>release(e,true));
  listen(overlay,'pointerleave',()=>{hover=null;enqueue();});
  listen(overlay,'wheel',e=>{e.preventDefault();zoom(Math.exp(-e.deltaY*(e.ctrlKey ? .012 : .002)));},{passive:false});
  listen(overlay,'keydown',e=>{
    if(e.key==='Escape'){close();return;}
    const delta={ArrowUp:[0,10],ArrowDown:[0,-10],ArrowLeft:[-15,0],ArrowRight:[15,0]}[e.key];
    if(delta){flight=null;view.lon=wrap(view.lon+delta[0]);view.lat=clamp(view.lat+delta[1],-90,90);enqueue();}
    else if(e.key==='+'||e.key==='=')zoom(1.2);
    else if(e.key==='-')zoom(1/1.2);
    else if(e.key==='Home')reset();
    else return;
    e.preventDefault();
  });
  listen(document,'visibilitychange',()=>{if(document.hidden){flight=null;cancelAnimationFrame(frame);frame=0;}else enqueue();});
  listen(popup,'keydown',e=>{if(e.key==='Escape'){close();overlay.focus();}});
  return {focus,zoom,reset,destroy(){
    dead=true;cancelAnimationFrame(frame);observer.disconnect();abort.abort();renderer?.dispose();layer.remove();
  }};
}
