import {comparisonGraphic} from './compare.js?v=batch02'
import {diagram,esc} from './diagrams.js?v=world4'
import {analyze,fmt,names,signed} from './theory.js?v=regional1'

export function rotateModel(model,degree){
 if(!model.circle_ready||model.reference_pitch_only||!degree)return model
 const s=model.intervals_cents
 return {...model,intervals_cents:[...s.slice(degree),...s.slice(0,degree)]}
}
const mod=(x,n)=>(x%n+n)%n
export function rotateTonic(t,delta){return mod(Math.round(2*t)+delta,24)/2}
export function tonicName(t,pref){return names(pref)[Math.floor(t)]+(t%1?' +50¢':'')}
const xy=(pitch,r)=>[180+r*Math.sin(pitch*Math.PI/600),180-r*Math.cos(pitch*Math.PI/600)]
export function wheel(model,t,pref,ref,other){

 const ring=[0,2,4,5,7,9,11].map((n,i)=>{
  const p=(n-t)*100,[x,y]=xy(p,59),[a,b]=xy(p,71),[c,d]=xy(p,80)
  return '<line x1="'+a+'" y1="'+b+'" x2="'+c+'" y2="'+d+'" stroke="currentColor"/><text x="'+x+'" y="'+y+'" text-anchor="middle" dominant-baseline="central" font-size="14">'+ 'CDEFGAB'[i]+'</text>'
 }).join('')
 const dial='<g class="dial"><circle cx="180" cy="180" r="80" class="dialface"/><g class="dial-notes">'+ring+'</g><path class="dial-arrows" d="M150 176l-4 4 4 4 M210 176l4 4-4 4" fill="none" stroke="currentColor"/><text x="180" y="180" text-anchor="middle" font-size="17">'+esc(tonicName(t,pref))+'</text><text x="180" y="196" text-anchor="middle" font-size="10">' +(model.reference_pitch_only?'REFERENCE':'TONIC')+'</text></g>'
 return comparisonGraphic(model,other,t,pref,dial)
}
const symbol=v=>Math.abs(v)<1e-6?'♮':Math.abs(v-100)<1e-6?'♯':Math.abs(v+100)<1e-6?'♭':signed(v)+'¢'
export function notation(m,t,pref,ref){
 const a=analyze(m,t,pref,ref)
 const order=a.affected[0]?.offset>0?'FCGDAEB':'BEADGCF'
 const affected=a.signature.startsWith('Conventional')?[...a.affected].sort((x,y)=>order.indexOf(x.letter)-order.indexOf(y.letter)):a.affected
 const pattern=affected.map(r=>r.letter+symbol(r.offset)).join(' · ')
 const signature=a.signature.startsWith('No unique')?'':pattern||'All natural'
 const seq=a.rows.map(r=>'<span class="note"><b>'+esc(r.letter)+'</b><small>'+symbol(r.offset)+'</small></span>').join('')
 const staff=a.rows.every(r=>r.degree!==undefined)?staffNotes(a.rows):''
 const degrees=a.rows.map((r,i)=>'<tr><td>'+(i+1)+'</td><td>'+fmt(r.p)+'</td><td>'+esc(r.letter)+'</td><td>'+signed(r.offset)+'</td><td>'+signed(r.deviation)+'</td></tr>').join('')
 return '<h3>'+a.signature+'</h3><p><strong>'+signature+'</strong></p>'+staff+'<div class="notes">'+seq+'</div>'+(a.omitted.length?'<p>Omitted letters · '+a.omitted.join(', ')+'</p>':'')+'<details><summary>Pitch positions and signed deviations</summary><div class="scroll"><table><thead><tr><th>Degree</th><th>Pitch (¢)</th><th>Letter / pitch</th><th>Alteration (¢)</th><th>From notation baseline (¢)</th></tr></thead><tbody>'+degrees+'</tbody></table></div></details>'
}

function staffNotes(rows){
 // Treble staff, bottom line E4. Position scale degrees relative to the first written letter in octave 4.
 const first='CDEFGAB'.indexOf(rows[0].letter), width=36+rows.length*60
 const y=k=>78-5*(k-2)
 let marks=''
 for(let k=2;k<=10;k+=2)marks+='<line x1="8" x2="'+(width-8)+'" y1="'+y(k)+'" y2="'+y(k)+'" stroke="currentColor" opacity=".55"/>'
 // The spiral encircles G4 (y=68), the second line from the bottom.
 marks+='<g aria-label="Treble clef" fill="none" stroke="currentColor" stroke-linecap="round"><path stroke-width="2.5" d="M23 74 C15 70 18 61 25 61 C35 60 37 74 28 78 C19 83 9 75 11 64 C13 53 28 46 29 32 C30 22 26 19 24 25 C20 34 23 48 25 60 L29 85 C31 96 19 99 19 90"/><circle cx="20" cy="89" r="2.8" fill="currentColor"/></g>'
 rows.forEach((r,i)=>{
  const k=first+r.degree,x=42+60*i
  for(let l=0;l>=k;l-=2)marks+='<line x1="'+(x-10)+'" x2="'+(x+10)+'" y1="'+y(l)+'" y2="'+y(l)+'" stroke="currentColor"/>'
  for(let l=12;l<=k;l+=2)marks+='<line x1="'+(x-10)+'" x2="'+(x+10)+'" y1="'+y(l)+'" y2="'+y(l)+'" stroke="currentColor"/>'
  marks+='<ellipse cx="'+x+'" cy="'+y(k)+'" rx="6" ry="4.2" fill="currentColor"/><text x="'+x+'" y="110" text-anchor="middle" font-size="11">'+r.letter+(Math.abs(r.offset)>1e-6?symbol(r.offset):'')+'</text>'
 })
 return '<figure class="staff"><figcaption>Treble staff · written pitch comparison</figcaption><svg viewBox="0 0 '+width+' 120" role="img" aria-label="Ascending pitches on the treble staff with exact alterations below each note">'+marks+'</svg></figure>'
}
