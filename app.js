import {player} from './sound.js?v=touch5'
import {modes,solfege} from './modes.js'
import {esc} from './diagrams.js'
import {nearestDegree} from './compare.js'
import {positions,fmt,signed} from './theory.js'
import {wheel,notation,rotateTonic,rotateModel,tonicName} from './wheel.js?v=batch02'
import {mountGlobe} from './globe.js?v=touch5'
const by=id=>document.getElementById(id)
const query=new URLSearchParams(location.search)
const response=await fetch(new URL('./catalog.json',import.meta.url))
if(!response.ok)throw Error('Could not load tuning catalog')
const {scales,regions,sources}=await response.json()
const all=[...scales,...modes]
const lookup=id=>all.find(m=>m.id===id)
const label=m=>[m.name,m.local_script,m.variant,m.tuning_model].filter(Boolean).join(' · ')
function select(id,choices,value){
 const el=by(id);el.replaceChildren(...choices.map(([k,v])=>new Option(v,k)))
 if(choices.some(([k])=>String(k)===String(value)))el.value=value
}
const groups=[...regions,{id:'western',label:'Western diatonic modes'}]
const requested=lookup(query.get('model'))
select('region',[['','Choose a region'],...groups.map(g=>[g.id,g.label])],requested?.geo_id||query.get('region'))
select('comparison',[['','None'],...all.map(m=>[m.id,label(m)])],query.get('comparison'))
const initialTonic=Number(query.get('tonic'))
let tonic=Number.isFinite(initialTonic)?rotateTonic(initialTonic,0):0
let degree=0
const pref=query.get('spelling')==='Flats'?'Flats':'Sharps'
let active=null,region='',menuTimer,playing=false
let voice='play'
const audio=player(isPlaying=>{
 playing=isPlaying
 by('play').textContent=isPlaying&&voice==='play'?'■ Stop':(active?.reference_pitch_only?'▶ Play pitches':'▶ Play scale')
 by('audition').textContent=isPlaying&&voice==='audition'?'■ Stop comparison':'▶ Play comparison'
})
function storeView(push=false){
 const url=new URL(location.href);url.search='';url.hash=''
 if(region)url.searchParams.set('region',region)
 if(active){
  url.searchParams.set('model',active.id)
  url.searchParams.set('tonic',tonic)
  if(degree)url.searchParams.set('degree',degree)
  if(pref==='Flats')url.searchParams.set('spelling',pref)
  if(by('comparison').value)url.searchParams.set('comparison',by('comparison').value)
 }
 history[push?'pushState':'replaceState'](null,'',url)
}
const globe=mountGlobe(by('earth'),regions,id=>chooseRegion(id,true))
function chooseRegion(id,push=false,animate=true){
 const group=groups.find(g=>g.id===id);if(!group)return
 closePanel();clearTimeout(menuTimer);audio.stop();active=null;region=id
 by('detail').hidden=true;by('atlas').hidden=false;by('region-list').open=false;by('region').value=id
 const models=all.filter(m=>m.geo_id===id)
 select('model',[['','Choose a scale'],...models.map(m=>[m.id,label(m)])],'')
 by('scale-label').hidden=!models.length;by('coverage').textContent=models.length?'':'Research coverage only. No numerical tuning is available yet.'
 by('region-title').textContent=group.label;by('picker').hidden=true
 if(id==='western')globe.reset();else globe.focus(id)
 const delay=animate&&!matchMedia('(prefers-reduced-motion: reduce)').matches?420:0
 menuTimer=setTimeout(()=>{by('picker').hidden=false;(models.length?by('model'):by('dismiss')).focus({preventScroll:true})},delay)
 storeView(push);window.scrollTo(0,0)
}
function home(push=false){
 clearTimeout(menuTimer);active=null;region='';audio.stop();globe.reset()
 by('picker').hidden=true;by('region-list').open=false;by('region').value='';by('atlas').hidden=false;by('detail').hidden=true;storeView(push)
}
function openScale(m,start=0,push=true){
 clearTimeout(menuTimer);audio.stop();active=m;region=m.geo_id
 degree=m.circle_ready&&!m.reference_pitch_only&&Number.isInteger(Number(start))&&start>=0&&start<m.notes_count?Number(start):0
 by('detail').hidden=false;by('atlas').hidden=true
 for(const [button,panel] of [['info','explanation'],['signature','score'],['compare','compare-panel']]){by(button).setAttribute('aria-expanded','false');by(panel).hidden=true}
 render();storeView(push);window.scrollTo(0,0);by('title').focus({preventScroll:true})
}
function current(){return rotateModel(active,degree)}
function render(){
 if(!active)return
 const m=current(),t=tonic,ref='Major',other=lookup(by('comparison').value)
 const name=active.geo_id==='western'?modes[(modes.indexOf(active)+degree)%7].name:active.name
 by('title').textContent=(active.reference_pitch_only?'Reference ':'')+tonicName(t,pref)+' '+name+(degree&&active.geo_id!=='western'?' · rotation '+(degree+1):'')
 if(!playing)by('play').textContent=active.reference_pitch_only?'▶ Play pitches':'▶ Play scale'
 by('subtitle').textContent=[active.local_script,active.tradition,active.category,active.variant].filter(Boolean).join(' · ')
 by('panels').innerHTML='<div '+'class="interactive-wheel" tabindex="0" aria-label="Diatonic ring. Use left and right arrows to transpose."'+'>'+wheel(m,t,pref,ref,other)+'</div>'+'<p class="dial-tip">Drag to transpose · Tap left or right for ±50¢</p>'
 by('steps').textContent='Steps in cents · '+m.intervals_cents.map(fmt).join(' · ')
 by('score').querySelector('.content').innerHTML=notation(m,t,pref,ref)
 const refs=active.source_ids.map(id=>sources.find(s=>s.id===id)).filter(Boolean)
 by('explanation').querySelector('.content').innerHTML='<h2>About this tuning</h2><p>'+esc([active.name,active.tradition,active.tuning_model].filter(Boolean).join(' · '))+'</p>'+(active.context_note?'<p>'+esc(active.context_note)+'</p>':'')+(active.audit_status?'<p><strong>Evidence review:</strong> '+esc(active.audit_status)+(active.audit_note?' — '+esc(active.audit_note):'')+'</p>':'')+'<p>'+(m.circle_ready?'Read clockwise from the top. Each colored arc spans one step between successive scale notes. Its width shows the interval size in cents (100¢ = one equal-tempered semitone). The inner letters are diatonic reference notes. Drag them to transpose the reference pitch. Signature lists the sounding notes and their exact alterations.':'This open span ends at its documented final pitch.')+'</p>'+refs.map(s=>'<p><a href="'+esc(s.url)+'">'+esc(s.citation)+'</a></p>').join('')+(refs.length?'<small>Source interpretation under review.</small>':'')
 by('compare').classList.toggle('active',Boolean(other))
 by('compare').setAttribute('aria-label',other?'Compare · '+other.name:'Compare')
 by('remove-comparison').hidden=!other
 by('legend').hidden=!other;by('audition').hidden=!other
 const rings=m.circle_ready&&other?.circle_ready
 by('legend').textContent=other?(rings?'Outer':'Upper')+' · '+m.name+'　'+(rings?'Inner':'Lower')+' · '+other.name:''
 by('inspection').textContent=other?'Select an interval to inspect its nearest pitch in the other scale.':''

}
by('model').onchange=e=>{const m=lookup(e.target.value);if(m)openScale(m)}
by('region').onchange=e=>{if(e.target.value)chooseRegion(e.target.value,true)}
by('return').onclick=()=>chooseRegion(region,true,false)
by('dismiss').onclick=()=>home(true)
let opened
function closePanel(restore=false,fade=false){
 if(!opened)return
 const {button,panel}=opened
 const finish=()=>{if(opened?.panel!==panel)panel.hidden=true}
 if(fade&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
  panel.animate([{opacity:1},{opacity:0}],{duration:110})
  setTimeout(finish,110)
 }else panel.hidden=true
 button.setAttribute('aria-expanded','false')
 opened=null
 if(restore)button.focus({preventScroll:true})
}
function positionPanel(){
 if(!opened)return
 const {button,panel}=opened,box=button.getBoundingClientRect(),gap=10
 const above=box.top-gap,below=innerHeight-box.bottom-gap
 const down=below>=above
 panel.style.maxHeight=Math.max(44,(down?below:above)-gap)+'px'
 panel.style.left=Math.max(gap,Math.min(box.left,document.documentElement.clientWidth-panel.offsetWidth-gap))+'px'
 panel.style.top=(down?box.bottom+gap:Math.max(gap,box.top-gap-panel.offsetHeight))+'px'
}
for(const [id,target] of [['info','explanation'],['signature','score'],['compare','compare-panel']]){
 const button=by(id),panel=by(target)
 button.onclick=()=>{
  if(opened?.button===button){closePanel(true,true);return}
  closePanel();opened={button,panel};panel.hidden=false
  button.setAttribute('aria-expanded','true')
  positionPanel();panel.querySelector('.close').focus({preventScroll:true})
 }
 panel.querySelector('.close').onclick=()=>closePanel(true,true)
}
document.addEventListener('pointerdown',event=>{
 if(opened&&!opened.button.contains(event.target)&&!opened.panel.contains(event.target))closePanel(false,!event.target.closest('#signature,#info,#compare'))
})
document.addEventListener('keydown',event=>{if(event.key==='Escape')closePanel(true,true)})
const panelResize=new ResizeObserver(positionPanel)
for(const panel of document.querySelectorAll('.overlay'))panelResize.observe(panel)
window.addEventListener('resize',positionPanel)
window.addEventListener('scroll',positionPanel)
for(const button of ['play','audition'])by(button).onclick=async()=>{
 if(playing&&voice===button){audio.stop();return}
 voice=button
 try{await audio.start(button==='play'?current():lookup(by('comparison').value),tonic)}
 catch{by(button).textContent='Retry playback'}
}
by('comparison').onchange=()=>{audio.stop();render();storeView();closePanel(true)}
by('remove-comparison').onclick=()=>{by('comparison').value='';by('comparison').onchange()}
function inspect(e){
 const segment=e.target.closest('[data-degree]')
 if(!segment)return
 const layer=Number(segment.dataset.layer),i=Number(segment.dataset.degree)
 const models=[current(),lookup(by('comparison').value)],m=models[layer],other=models[1-layer]
 const pitch=positions(m.intervals_cents)[i]
 let message=m.name+' · degree '+(i+1)+' · '+fmt(pitch)+(m.reference_pitch_only?'¢ from reference pitch · next step ':'¢ from tonic · next step ')+fmt(m.intervals_cents[i])+'¢'
 for(const g of by('panels').querySelectorAll('.selected-degree'))g.classList.remove('selected-degree')
 segment.classList.add('selected-degree')
 if(other){
  const cyclic=m.circle_ready&&other.circle_ready
  const ps=positions(other.intervals_cents)
  if(cyclic)ps.pop()
  const match=nearestDegree(ps,pitch,cyclic)
  by('panels').querySelector('[data-layer="'+(1-layer)+'"][data-degree="'+match.index+'"]')?.classList.add('selected-degree')
  message+=' · nearest in '+other.name+' at '+fmt(ps[match.index])+'¢ ('+signed(match.delta)+'¢)'
 }
 by('inspection').textContent=message
}
for(const type of ['click','focusin','pointerover'])by('panels').addEventListener(type,inspect)
function applyTonic(value,step=0,save=true){
 const previous=tonic
 if(value===previous)return
 tonic=value
 if(playing)audio.retune(value-previous)
 render();if(save)storeView()
 if(step&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
  by('panels').querySelector('.dial-notes')?.animate(
   [{transform:'rotate('+step*15+'deg)'},{transform:'rotate(0deg)'}],
   {duration:140,easing:'ease-out'})
 }
}
function transpose(delta){applyTonic(rotateTonic(tonic,delta),delta)}

by('panels').onkeydown=e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();transpose(e.key==='ArrowRight'?1:-1);by('panels').firstElementChild.focus({preventScroll:true})}}
let drag
const angle=(e,c)=>Math.atan2(e.clientX-c.x,c.y-e.clientY)
by('panels').onpointerdown=e=>{
 const dial=e.target.closest('.interactive-wheel .dial');if(drag||!dial||e.button!==0)return
 const box=dial.closest('svg').getBoundingClientRect(),c={x:box.left+box.width/2,y:box.top+box.height/2}
 drag={c,x:e.clientX,y:e.clientY,moved:false,angle:angle(e,c),travel:0,base:tonic,id:e.pointerId}
 by('panels').setPointerCapture(e.pointerId);e.preventDefault()
}
by('panels').onpointermove=e=>{
 if(!drag||e.pointerId!==drag.id)return
 if(!drag.moved&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)<6)return
 drag.moved=true
 const a=angle(e,drag.c),delta=a-drag.angle
 drag.travel+=Math.atan2(Math.sin(delta),Math.cos(delta));drag.angle=a
 const t=rotateTonic(drag.base,-Math.round(drag.travel*12/Math.PI))
 applyTonic(t,0,false)
}
by('panels').onpointerup=e=>{
 if(!drag||e.pointerId!==drag.id)return
 if(drag.moved)storeView()
 else if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)<6)transpose(e.clientX<drag.c.x?-1:1)
 drag=null
}
by('panels').onpointercancel=by('panels').onlostpointercapture=e=>{if(e.pointerId===drag?.id){if(drag.moved)storeView();drag=null}}

by('minus').onclick=()=>globe.zoom(1/1.2);by('plus').onclick=()=>globe.zoom(1.2);by('reset').onclick=()=>home(true)
window.addEventListener('pagehide',audio.stop)
window.addEventListener('popstate',()=>location.reload())
if(requested)openScale(requested,query.get('degree'),false)
else if(groups.some(g=>g.id===query.get('region')))chooseRegion(query.get('region'),false,false)
