import {positions,fmt,names,nearest,signed} from './theory.js'
import {esc} from './diagrams.js'

const colors=['#527f95','#796d99','#48836f','#a36e42','#5579a4','#98724c','#98627d']
const point=(c,r)=>[180+r*Math.sin(c*Math.PI/600),180-r*Math.cos(c*Math.PI/600)]
const pitchName=(c,t,pref)=>{
 const absolute=c+t*100, equal=nearest(absolute), offset=absolute-equal
 return names(pref)[((equal/100)%12+12)%12]+(Math.abs(offset)<.001?'':offset>0?'↑':'↓')
}
export function nearestDegree(pitches,position,cyclic){
 let best
 pitches.forEach((p,index)=>{
  let delta=p-position
  if(cyclic)delta=((delta+1800)%1200)-600
  if(!best||Math.abs(delta)<Math.abs(best.delta))best={index,delta}
 })
 return best
}
const isOctave=m=>m.circle_ready&&Math.abs(positions(m.intervals_cents).at(-1)-1200)<.001
export function comparisonGraphic(primary,secondary,tonic,pref,dial){
 const models=secondary?[primary,secondary]:[primary]
 const circular=models.every(isOctave)
 const sets=models.map(m=>positions(m.intervals_cents))
 const extent=Math.max(...sets.map(p=>p.at(-1)))
 const layers=models.map((m,layer)=>{
  const radius=layer?88:114, thickness=layer?22:24
  return m.intervals_cents.map((step,i)=>{
   const start=sets[layer][i],end=start+step
   const fill=colors[Math.min(colors.length-1,Math.floor(step/50))]
   const note=pitchName(start,tonic,pref)
   const name=(layer?'Comparison':'Primary')+' · '+m.name+' · degree '+(i+1)+' · '+note+' · '+fmt(start)+(m.reference_pitch_only?'¢ from reference pitch · step ':'¢ from tonic · step ')+fmt(step)+'¢'
   const attributes='tabindex="0" role="button" data-layer="'+layer+'" data-degree="'+i+'" aria-label="'+esc(name)+'"'
   if(!circular){
    const x=12+start/extent*336,w=step/extent*336,y=22+layer*44
    return '<g '+attributes+'><title>'+esc(name)+'</title><rect x="'+x+'" y="'+y+'" width="'+w+'" height="24" fill="'+fill+'" stroke="var(--bg)"/></g>'
   }
   const [x,y]=point(start,138),[cx,cy]=point(start+step/2,radius)
   const path='M'+point(start,radius)+' A'+radius+' '+radius+' 0 '+(step>600?1:0)+' 1 '+point(end,radius)
   const intervalLabel=step>125&&fmt(step).length<=4?'<text class="onarc" x="'+cx+'" y="'+cy+'" font-size="10">'+fmt(step)+'¢</text>':''
   return '<g '+attributes+'><title>'+esc(name)+'</title><path d="'+path+'" fill="none" stroke="'+fill+'" stroke-width="'+thickness+'"/><path d="M'+point(start,radius-thickness/2)+' L'+point(start,radius+thickness/2)+'" stroke="var(--bg)"/>'+intervalLabel+(layer?'':'<text x="'+x+'" y="'+y+'" font-size="10">'+note+'</text>')+'</g>'
  }).join('')
 }).join('')
 if(!circular)return '<svg class="wheel span-dial" viewBox="91 91 178 178" aria-label="Transpose reference pitch">'+dial+'</svg><div class="span-comparison"><strong>Measured spans · shared cent axis</strong><svg viewBox="0 0 360 108" aria-label="Pitch distances from the shared reference pitch">'+layers+'</svg><small>0¢ to '+fmt(extent)+'¢ · '+models.map((m,i)=>esc(m.name)+' ends at '+fmt(sets[i].at(-1))+'¢').join(' · ')+'</small></div>'
 return '<svg class="wheel comparative" viewBox="26 26 308 308" aria-label="Intervals measured clockwise from the shared reference pitch">'+layers+'<g transform="translate(180 180) scale('+(secondary ? .89 : 1.19)+') translate(-180 -180)">'+dial+'</g></svg>'
}
