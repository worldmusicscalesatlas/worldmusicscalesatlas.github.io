import {test} from 'node:test'
import assert from 'node:assert/strict'
import {models} from './examples.js'
import {analyze,positions} from './theory.js'
import {diagram} from './diagrams.js'
test('Five generated examples retain their ordered positions for every tonic',()=>{
 assert.equal(models.length,5)
 for(const m of models){
  const positionsInCents=positions(m.steps)
  assert.equal(Math.abs(positionsInCents.at(-1)-1200)<1e-8,m.circle_ready)
  for(let t=0;t<12;t++)for(const ref of ['Major','Dorian','Nearest 12-TET']){
   assert.deepEqual(analyze(m,t,'Sharps',ref).rows.map(r=>r.p),positionsInCents.slice(0,m.notes_count))
   const svg=diagram(m,t,'Sharps',ref)
   assert.match(svg,m.circle_ready?/interval circle/:/Open interval strip/);assert.doesNotMatch(svg,/NaN|undefined/)
  }
 }
})
import {readFileSync} from 'node:fs'
import {wheel,rotateModel,rotateTonic,notation} from './wheel.js'
const catalog=JSON.parse(readFileSync(new URL('./catalog.json',import.meta.url)))
test('Every geographic model is selectable and transposable through 24 ring positions',()=>{
 assert.equal(catalog.scales.length,226)
 for(const m of catalog.scales){
  assert.ok(catalog.regions.find(g=>g.id===m.geo_id).model_ids.includes(m.id))
  for(let t=0;t<12;t+=.5){
   assert.doesNotMatch(notation(m,t,'Sharps','Major'),/undefined|NaN/)
   const drawing=wheel(m,t,'Sharps','Major');assert.ok(drawing.includes('class="dial"'));assert.equal(drawing.includes('span-comparison'),!m.circle_ready)
  }
 }
 assert.equal(rotateTonic(11.5,1),0)
 const major=models.find(m=>m.id==='major')
 assert.match(notation(major,2,'Sharps','Major'),/F♯ · C♯/)
 assert.deepEqual(rotateModel(major,1).intervals_cents,[200,100,200,200,200,100,200])
})
import {modes} from './modes.js'
test('Dorian signatures follow tonic, and Shur preserves its research tuning',()=>{
 const dorian=modes.find(m=>m.name==='Dorian')
 for(const [tonic,signature] of [[0,'B♭ · E♭'],[2,'All natural'],[4,'F♯ · C♯']])
  assert.ok(notation(dorian,tonic,'Sharps','Major').includes(signature))
 const shur=catalog.scales.find(m=>m.name==='Shur')
 for(const t of [0,2,11])assert.deepEqual(analyze(shur,t).rows.map(r=>r.p),positions(shur.intervals_cents).slice(0,-1))
})
import {frequencies} from './sound.js'
test('playback preserves measured spans, microtonal intervals and transposition',()=>{
 for(const m of catalog.scales){
  const hz=frequencies(m,2.5)
  assert.equal(hz.length,m.intervals_cents.length+1)
  m.intervals_cents.forEach((step,i)=>assert.ok(Math.abs(1200*Math.log2(hz[i+1]/hz[i])-step)<1e-8))
  assert.ok(Math.abs(hz[0]/frequencies(m,2)[0]-2**(50/1200))<1e-10)
 }
})

import {nearestDegree} from './compare.js'
test('Concentric rings retain original degrees and open comparisons share a linear axis',()=>{
 const shur=catalog.scales.find(m=>m.name==='Shur')
 const major=modes[0]
 const draw=wheel(shur,2,'Sharps','Major',major)
 assert.equal((draw.match(/data-layer="0"/g)||[]).length,shur.intervals_cents.length)
 assert.equal((draw.match(/data-layer="1"/g)||[]).length,major.intervals_cents.length)
 assert.deepEqual(nearestDegree([0,200],1190,true),{index:0,delta:10})
 assert.deepEqual(nearestDegree([0,200],1190,false),{index:1,delta:-990})
 for(const m of catalog.scales.filter(m=>!m.circle_ready)){
  const chart=wheel(major,3,'Sharps','Major',m)
  assert.match(chart,/shared cent axis/);assert.doesNotMatch(chart,/undefined|NaN/)
 }
})

test('Batch 02 Javanese observations preserve the verified source values and distinctions',()=>{
 const expected=[["EXP-IDN-ELLIS-1885-SLENDRO-MEAN",[228,256,244,232,240],true,5],["EXP-IDN-ELLIS-1885-SLENDRO-LOWER-GENDER",[191,251,249,261,220],false,6],["EXP-IDN-ELLIS-1885-SLENDRO-UPPER-GENDER",[219,256,261,223,288],false,6],["EXP-IDN-ELLIS-1885-SLENDRO-LAND-SARON",[270,200,266,239,243],false,6],["EXP-IDN-ELLIS-1885-PELOG-INVENTORY",[137,309,129,112,133,278,102],true,7],["EXP-IDN-ELLIS-1885-PELOG-DANGSOE",[137,550,133,278,102],true,5],["EXP-IDN-ELLIS-1885-PELOG-BEM-ELLIS",[137,438,112,411,102],true,5],["EXP-IDN-ELLIS-1885-PELOG-BEM-LAND",[147,416,96,429,112],true,5],["EXP-IDN-ELLIS-1885-PELOG-BARANG-ELLIS",[137,438,112,133,380],true,5],["EXP-IDN-ELLIS-1885-PELOG-BARANG-LAND",[151,426,111,179,333],true,5]]
 const region=catalog.regions.find(g=>g.id==='exp-idn')
 assert.ok(region);assert.deepEqual(region.country_iso3_for_navigation,['IDN'])
 assert.equal(catalog.regions.length,18);assert.equal(catalog.sources.length,29)
 assert.deepEqual(region.model_ids,expected.map(row=>row[0]))
 for(const [id,steps,circular,n] of expected){
  const model=catalog.scales.find(m=>m.id===id)
  assert.ok(model);assert.deepEqual(model.intervals_cents,steps)
  assert.equal(model.circle_ready,circular);assert.equal(model.notes_count,n)
  assert.equal(model.reference_pitch_only,true);assert.ok(model.context_note)
  assert.deepEqual(model.source_ids,['EXP-ELLIS-1885'])
  assert.deepEqual(rotateModel(model,1).intervals_cents,steps)
  assert.match(wheel(model,0,'Sharps','Major'),/REFERENCE/)
 }
 assert.match(catalog.scales.find(m=>m.id.endsWith('PELOG-INVENTORY')).category,/not a mode/)
 assert.ok(catalog.sources.some(s=>s.id==='EXP-ELLIS-1885'))
})
