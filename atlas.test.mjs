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
 assert.equal(catalog.scales.length,240)
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
 assert.equal(catalog.regions.length,22);assert.equal(catalog.sources.length,44)
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

test('Batch 03 Japanese and Ryukyuan models preserve interval order, provenance and reference-pitch semantics',()=>{
 const expected=[["B03-JP-MIYAKO","b03-japan",[100,400,200,100,400],"Theoretical modal representation"],["B03-JP-MINYO","b03-japan",[300,200,200,300,200],"Theoretical modal representation"],["B03-JP-RITSU","b03-japan",[200,300,200,200,300],"Theoretical modal representation"],["B03-JP-RYUKYU","b03-ryukyu",[400,100,200,400,100],"Theoretical modal representation"],["B03-JP-KOTO-ISAWA","b03-japan",[204,112,386,112,386],"Historical tuning observation"],["B03-JP-KOTO-MASTER","b03-japan",[185,152,346,107,410],"Historical tuning observation"]]
 const japan=catalog.regions.find(g=>g.id==='b03-japan'),ryukyu=catalog.regions.find(g=>g.id==='b03-ryukyu')
 assert.ok(japan&&ryukyu);assert.deepEqual(japan.country_iso3_for_navigation,['JPN']);assert.deepEqual(ryukyu.country_iso3_for_navigation,['JPN'])
 assert.deepEqual(japan.model_ids,expected.filter(row=>row[1]==='b03-japan').map(row=>row[0]));assert.deepEqual(ryukyu.model_ids,['B03-JP-RYUKYU'])
 for(const [id,geo,steps,category] of expected){
  const m=catalog.scales.find(s=>s.id===id);assert.ok(m);assert.equal(m.geo_id,geo);assert.equal(m.category,category)
  assert.deepEqual(m.intervals_cents,steps);assert.equal(steps.reduce((a,b)=>a+b,0),1200);assert.equal(m.notes_count,5);assert.equal(m.circle_ready,true)
  assert.equal(m.reference_pitch_only,true);assert.ok(m.context_note);assert.ok(m.source_ids.every(id=>catalog.sources.some(s=>s.id===id)))
  assert.deepEqual(rotateModel(m,1).intervals_cents,steps);assert.match(wheel(m,0,'Sharps','Major'),/REFERENCE/)
  const compared=wheel(m,2.5,'Sharps','Major',modes[0]);assert.doesNotMatch(compared,/undefined|NaN/)
 }
 assert.equal(catalog.scales.filter(s=>s.id.startsWith('B03-JP-')).length,6)
 assert.match(catalog.sources.find(s=>s.id==='EXP-ELLIS-1885').citation,/522–523/)
})

test('Batch 04 preserves Azerbaijani theoretical ranges and Thai measured spans',()=>{
 const expected=[["B04-AZ-RAST","b04-azerbaijan",[200,200,100,200,200,100,200,200,100],false,10],["B04-AZ-SHUR","b04-azerbaijan",[200,100,200,200,100,200,200,100,200],false,10],["B04-AZ-SEGAH","b04-azerbaijan",[100,200,200,100,200,200,100,200,200],false,10],["B04-AZ-CHARGAH","b04-azerbaijan",[100,300,100,100,300,100,200,100,300,100],false,11],["B03-TH-7EDO","b03-thailand",[171.42857142857142,171.42857142857142,171.42857142857142,171.42857142857142,171.42857142857142,171.42857142857142,171.42857142857142],true,7],["B03-TH-REF","b03-thailand",[155,170,180,170,180,160,185],true,7],["B03-TH-RANAT-THUM","b03-thailand",[185,180,165,170,170,170,170,180,180,165,170,170,170,170,180,180],false,17],["B03-TH-RANAT-EK","b03-thailand",[255,170,170,170,170,180,180,165,170,170,170,170,180,180,165,170,170,170,170,180,180],false,22]]
 for(const [id,geo,steps,circular,n] of expected){
  const m=catalog.scales.find(s=>s.id===id);assert.ok(m);assert.equal(m.geo_id,geo)
  assert.deepEqual(m.intervals_cents,steps);assert.equal(m.circle_ready,circular);assert.equal(m.notes_count,n)
  assert.ok(m.context_note);assert.equal(m.reference_pitch_only,true);assert.ok(m.source_ids.every(id=>catalog.sources.some(s=>s.id===id)))
  assert.deepEqual(rotateModel(m,1).intervals_cents,steps);assert.match(wheel(m,0,'Sharps','Major'),/REFERENCE/)
  assert.doesNotMatch(wheel(m,2.5,'Sharps','Major',modes[0]),/undefined|NaN/)
 }
 assert.deepEqual(catalog.regions.find(g=>g.id==='b04-azerbaijan').country_iso3_for_navigation,['AZE'])
 assert.deepEqual(catalog.regions.find(g=>g.id==='b03-thailand').country_iso3_for_navigation,['THA'])
 assert.equal(catalog.sources.find(s=>s.id==='B04-TH-WISUTTIPAT-2015').license,'CC BY 4.0')
 assert.equal(catalog.scales.filter(m=>m.id.startsWith('B04-AZ-')).length,4)
 assert.equal(catalog.scales.filter(m=>m.id.startsWith('B03-TH-')).length,4)
})
