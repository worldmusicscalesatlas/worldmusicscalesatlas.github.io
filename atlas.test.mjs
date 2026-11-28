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
 assert.equal(catalog.scales.length,393)
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
 assert.equal(catalog.regions.length,65);assert.equal(catalog.sources.length,99)
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

test('Batches 05–08 retain documented pitch ranges, original tuning sequences and provenance',()=>{
 const expected=[["B05-KR-01","b05-korea",[200,300,200,200],false,5],["B05-KR-02","b05-korea",[200,300,200,300],false,5],["B05-KR-03","b05-korea",[300,200,200,300],false,5],["B05-KR-04","b05-korea",[200,300,200,200],false,5],["B05-KR-05","b05-korea",[200,300,200,300],false,5],["B06-ET-M0159","b06-ethiopia",[353,195,171,291],false,5],["B06-ET-M0161","b06-ethiopia",[338,202,197,268],false,5],["B06-ET-M0162","b06-ethiopia",[375,179,205,332],false,5],["B06-ET-M0164","b06-ethiopia",[326,228,158,272],false,5],["B06-ET-M0165","b06-ethiopia",[309,222,161,322],false,5],["B06-ET-M0166","b06-ethiopia",[308,174,175,342],false,5],["B06-ET-M0176","b06-ethiopia",[367,127,194,387],false,5],["B06-ET-M0179","b06-ethiopia",[348,183,209,303],false,5],["B06-ET-M0180","b06-ethiopia",[351,179,182,351],false,5],["B06-ET-M0183","b06-ethiopia",[344,194,144,372],false,5],["B06-ET-M0185","b06-ethiopia",[384,187,162,329],false,5],["B06-ET-M0186","b06-ethiopia",[333,172,195,390],false,5],["B07-HU-01","b07-hungary",[300,200,200,300,200],true,5],["B07-ES-01","b07-andalusia",[100,300,100,200,100,300,100],true,7],["B08-SB-01","b08-areare",[171.42857142857142,171.42857142857142,171.42857142857142,171.42857142857142,171.42857142857142,171.42857142857142,171.42857142857142],true,7],["B08-CO-M1","b08-colombia",[70,260,90,155,205,120,170,205,105,180,200,120,190,170,160,190],false,17],["B08-CO-M2","b08-colombia",[210,210,130,170,170,190,120,190,150,250,110,200,100],false,14],["B08-CO-M3","b08-colombia",[140,145,140,160,200,140,180,160,140,150,190,155,145,220,135,155,170,180,200],false,20],["B08-CO-M4","b08-colombia",[180,160,150,180,150,160,155,155,170,170,170,190,135,165,160,180,170,165,155],false,20],["B08-CO-M5","b08-colombia",[210,150,160,160,210,140,160,170,170,170,170,160,160,160,150,160,210,160,120,150,100],false,22],["B08-CO-M6","b08-colombia",[100,110,70,190,200,190,140,160,180,150,150,200,150,170,100,190,100],false,18],["B08-CO-M7","b08-colombia",[150,240,125,195,135,160,210,110,145,190,155,170,205,180,175,160,150,180,155,180,130,230,130],false,24],["B08-CO-M8","b08-colombia",[205,130,165,195,145,185,120,150,135,145,240,165,145,185,180,105,135],false,18],["B08-CO-M9","b08-colombia",[150,190,80,100,160,140,180,160,150,195,155,130,170,205,120,270,135,130,210,120,190,90],false,23]]
 for(const [id,geo,steps,circular,n] of expected){
  const m=catalog.scales.find(s=>s.id===id);assert.ok(m);assert.equal(m.geo_id,geo)
  assert.deepEqual(m.intervals_cents,steps);assert.equal(m.circle_ready,circular);assert.equal(m.notes_count,n)
  assert.ok(m.context_note);assert.equal(m.reference_pitch_only,true);assert.ok(m.source_ids.every(id=>catalog.sources.some(s=>s.id===id)))
  assert.deepEqual(rotateModel(m,1).intervals_cents,steps);assert.match(wheel(m,0,'Sharps','Major'),/REFERENCE/)
  assert.doesNotMatch(wheel(m,2.5,'Sharps','Major',modes[0]),/undefined|NaN/)
  if(id.startsWith('B06-ET-'))assert.equal(steps.reduce((a,b)=>a+b,0),m.reported_span_cents)
 }
 assert.equal(catalog.scales.filter(m=>/^B0[5-8]-/.test(m.id)).length,29)
})

test('Batches 09–10 evidence metadata, observed ranges and source integrity',()=>{
 const expected=[["B09-MM-PATALA","b09-myanmar",[166,181,168,179,173,179,167],false,8],["B09-MM-KYI-I","b09-myanmar",[162,173,183,154,175,168,153],false,8],["B09-MM-KYI-II","b09-myanmar",[193,187,163,149,183,187,159],false,8],["B09-AO-10450","b09-angola",[183,187,161,164,165,323,9],false,8],["B09-AO-10618","b09-angola",[146,213,178,136,176,341,15],false,8],["B09-AO-10622","b09-angola",[128,243,128,174,132,351,8],false,8],["B09-AO-10497","b09-angola",[175,199,134,169,192,337,31],false,8],["B09-AO-10500","b09-angola",[180,197,122,184,184,353,5],false,8],["B09-GE-TOP","b09-georgia",[173,167,162,199,186,168,170],false,8],["B09-GE-ALL","b09-georgia",[176,166,167,196,181,166,179],false,8],["B10-GB-ELLIS","b10-scotland",[197,144,154,208,150,156,191],true,7]]
 for(const [id,geo,steps,circular,n] of expected){
  const m=catalog.scales.find(s=>s.id===id);assert.ok(m);assert.equal(m.geo_id,geo)
  assert.deepEqual(m.intervals_cents,steps);assert.equal(m.circle_ready,circular);assert.equal(m.notes_count,n)
  assert.equal(m.reference_pitch_only,true);assert.match(m.audit_status,/Primary numerical evidence/)
  assert.deepEqual(rotateModel(m,1).intervals_cents,steps);assert.match(wheel(m,0,'Sharps','Major'),/REFERENCE/)
  assert.doesNotMatch(wheel(m,2.5,'Sharps','Major',modes[0]),/undefined|NaN/)
  if(m.reported_span_cents!==undefined)assert.equal(steps.reduce((a,b)=>a+b,0),m.reported_span_cents)
 }
 assert.equal(catalog.scales.filter(m=>/^B09-|^B10-/.test(m.id)).length,11)
 assert.equal(new Set(catalog.scales.map(m=>m.id)).size,catalog.scales.length)
 for(const m of catalog.scales){assert.ok(m.audit_status&&m.audit_note);assert.ok(m.intervals_cents.every(x=>Number.isFinite(x)&&x>0));assert.equal(m.circle_ready,Math.abs(m.intervals_cents.reduce((a,b)=>a+b,0)-1200)<1e-8);assert.ok(m.source_ids.length&&m.source_ids.every(id=>catalog.sources.some(s=>s.id===id)));assert.ok(catalog.regions.find(g=>g.id===m.geo_id).model_ids.includes(m.id))}
 assert.equal(catalog.scales.filter(m=>m.audit_status==='Source-based numerical representation rechecked').length,94)
 assert.equal(catalog.scales.filter(m=>m.audit_status==='Historical primary table rechecked').length,4)
})

import {playableRegions,coverageLabel} from './coverage.js'
test('Batches 11–14 preserve primary frequency observations',()=>{
 const expected=[["B11-BR-PIFANO-MEIA",[653,734,829,889,1020,1075,1183,1320,1487,1679,1784,2042,2180],[202,211,121,238,91,166,189,207,210,105,234,113],2087],["B11-BR-PIFANO-TRES",[623,695,791,825,959,995,1097,1225,1372,1552,1644,1912,2014],[189,224,73,261,64,169,191,196,213,100,261,90],2031],["B11-BR-PIFANO-INTER",[551,624,709,737,848,901,981,1084,1231,1407,1488,1739,1846],[215,221,68,242,105,148,172,221,231,97,270,103],2093]]
 for(const [id,hz,steps,span] of expected){
  const m=catalog.scales.find(s=>s.id===id);assert.ok(m);assert.deepEqual(m.source_frequencies_hz,hz);assert.deepEqual(m.intervals_cents,steps)
  const p=hz.map(v=>Math.round(1200*Math.log2(v/hz[0])));assert.deepEqual(steps,p.slice(1).map((v,i)=>v-p[i]));assert.equal(steps.reduce((a,b)=>a+b,0),span)
  assert.equal(m.circle_ready,false);assert.equal(m.notes_count,hz.length);assert.equal(m.reference_pitch_only,true);assert.ok(m.cultural_reuse_status)
  assert.doesNotMatch(wheel(m,2.5,'Sharps','Major',modes[0]),/undefined|NaN/)
 }
})

test('Public navigation contains only 65 playable geographic entries and linked references',()=>{
 assert.equal(catalog.scales.length,393);assert.equal(catalog.regions.length,65)
 assert.deepEqual(playableRegions(catalog.regions,catalog.scales),catalog.regions)
 const ids=new Set(catalog.scales.map(s=>s.id))
 for(const g of catalog.regions){assert.ok(g.model_ids.length);assert.ok(g.model_ids.every(id=>ids.has(id)&&catalog.scales.find(s=>s.id===id).geo_id===g.id));assert.equal(coverageLabel(g),g.model_ids.length+' models')}
 const assigned=catalog.regions.flatMap(g=>g.model_ids);assert.equal(assigned.length,393);assert.equal(new Set(assigned).size,393)
 for(const s of catalog.scales)assert.ok(assigned.includes(s.id))
 const referenced=new Set(catalog.scales.flatMap(m=>m.source_ids));assert.equal(referenced.size,99);assert.ok(catalog.sources.every(s=>referenced.has(s.id)))
 const fake=[{id:'empty',model_ids:[]},{id:'missing',model_ids:['missing-id']},{id:'context',coverage_status:'context_only',model_ids:['example']},{id:'wrong',model_ids:['example']},{id:'ok',model_ids:['example']}]
 assert.deepEqual(playableRegions(fake,[{id:'example',geo_id:'ok'}]).map(g=>g.id),['ok'])
})

test('Batches 15–18 preserve source-specific measured and teaching models',()=>{
 const expected=[["B15-EC-CAICEDO-1","b15-esmeraldas",[121.2,208.7,166,210.1,127.1,184.1,183.5,129,185,184,131,187,197,122,160,212],false,17],["B15-EC-CAICEDO-2","b15-esmeraldas",[146.3,187,169,178.9,150.6,178.9,171.5,139,189.9,157.4,192.5,136,207,144.2,124.7,171.5],false,17],["B15-EC-J-AYOVI","b15-esmeraldas",[162.9,216.3,193.8,135.4,165.3,220,194.8,184,170.5,170.5,214.1,113.3,195.2,186,232.4,88.2,195.2,206,86.6,253.3,194,202,79.6],false,24],["B17-WA-SILABA","b17-mande-kora",[200,200,100,200,200,200,100],true,7],["B17-WA-SAUTA","b17-mande-kora",[200,200,200,100,200,200,100],true,7],["B18-TH-KHENE-2025","b18-isan-khene",[193,55,240,211,57,200,49,199,206,68,225,222,28,233,220],false,16]]
 for(const [id,geo,steps,circular,n] of expected){const m=catalog.scales.find(s=>s.id===id);assert.ok(m);assert.equal(m.geo_id,geo);assert.deepEqual(m.intervals_cents,steps);assert.equal(m.circle_ready,circular);assert.equal(m.notes_count,n);assert.equal(m.reference_pitch_only,true);assert.ok(m.cultural_reuse_status);assert.deepEqual(rotateModel(m,1).intervals_cents,steps);assert.match(wheel(m,0,'Sharps','Major'),/REFERENCE/);assert.doesNotMatch(wheel(m,2.5,'Sharps','Major',modes[0]),/undefined|NaN/);if(m.source_reported_bar_count){assert.equal(m.notes_count,m.source_reported_bar_count);assert.equal(steps[0],m.source_reported_first_interval_cents)}}
 const khene=catalog.scales.find(m=>m.id==='B18-TH-KHENE-2025');const hz=[...khene.source_right_tubes_hz,...khene.source_left_tubes_hz].sort((a,b)=>a-b);assert.equal(hz.length,16);assert.deepEqual(hz,khene.source_frequencies_hz);const p=hz.map(v=>Math.round(1200*Math.log2(v/hz[0])));assert.deepEqual(khene.intervals_cents,p.slice(1).map((v,i)=>v-p[i]));assert.equal(khene.reported_span_cents,p.at(-1));assert.ok(hz.includes(384)&&hz.includes(395));assert.ok(hz.includes(887)&&hz.includes(331));assert.equal(catalog.scales.filter(m=>/^B1[5-8]-/.test(m.id)).length,6)
})

test('Batches 19–22 preserve documented pitch descriptions and nominal ranges',()=>{
 const expected=[["B19-BO-QUENA","b19-bolivia-quena",[200,200,100,200,200,200,100,200,200,100,200,200,200,100],false,15],["B20-GM-BALO","b20-gambia-balo",[171.42857142857142,171.42857142857142,171.42857142857142,171.42857142857142,171.42857142857142,171.42857142857142,171.42857142857142],true,7],["B20-MG-VALIHA","b20-madagascar-valiha",[200,200,100,200,200,200,100,200,200,100,200,200,200,100],false,15],["B21-VN-BAC","b21-vietnam-hue",[200,300,200,200,300],true,5],["B21-VN-NAM","b21-vietnam-hue",[300,200,200,300,200],true,5],["B22-KH-PENTA","b22-cambodia-khmer",[200,200,300,200,300],true,5],["B22-KH-HEPTA","b22-cambodia-khmer",[200,200,100,200,200,100,200],true,7]]
 for(const [id,geo,steps,circular,n] of expected){const m=catalog.scales.find(s=>s.id===id);assert.ok(m);assert.equal(m.geo_id,geo);assert.deepEqual(m.intervals_cents,steps);assert.equal(m.circle_ready,circular);assert.equal(m.notes_count,n);assert.equal(m.reference_pitch_only,true);assert.ok(m.cultural_reuse_status);assert.deepEqual(rotateModel(m,1).intervals_cents,steps);assert.match(wheel(m,0,'Sharps','Major'),/REFERENCE/);assert.doesNotMatch(wheel(m,2.5,'Sharps','Major',modes[0]),/undefined|NaN/);if(m.source_semitone_positions)assert.deepEqual(steps,m.source_semitone_positions.slice(1).map((v,i)=>100*(v-m.source_semitone_positions[i])))}
 const valiha=catalog.scales.find(m=>m.id==='B20-MG-VALIHA');const pitches=[...valiha.source_left_hand_midi,...valiha.source_right_hand_midi].sort((a,b)=>a-b);assert.equal(pitches.length,15);assert.deepEqual(valiha.intervals_cents,pitches.slice(1).map((v,i)=>100*(v-pitches[i])));assert.equal(pitches.at(-1)-pitches[0],24)
 const balo=catalog.scales.find(m=>m.id==='B20-GM-BALO');assert.equal(balo.category,'Theoretical tuning comparator');assert.ok(balo.intervals_cents.every(v=>v===1200/7));assert.equal(catalog.scales.filter(m=>/^B(19|20|21|22)-/.test(m.id)).length,7)
})

test('Batches 23–26 preserve measured fundamentals, statistical means and teaching pitch references',()=>{
 const expected=[["B23-NI-MARIMBA","b23-nicaragua-marimba",[200,200,100,200,200,100,200,200,200,100,200,200,100,200,200,200,100,200,200,100,200],false,22],["B23-TT-SOPRANO-OUTER","b23-trinidad-steelpan",[92,110,104,101,102,93,109,75,113,83,129],false,12],["B25-NG-UBOAKA-EZE","b25-igbo-uboaka",[200,200,100,200,200,100,200],true,7],["B26-LT-CLUSTER-1","b26-lithuania-vocal",[193,146,186,202],false,5],["B26-LT-CLUSTER-2","b26-lithuania-vocal",[218,166,118,184],false,5],["B26-LT-CLUSTER-4","b26-lithuania-vocal",[197,202,120,189],false,5],["B26-LT-CLUSTER-5","b26-lithuania-vocal",[197,111,198,196],false,5],["B26-LT-CLUSTER-6","b26-lithuania-vocal",[203,119,197,160],false,5],["B26-LT-CLUSTER-7","b26-lithuania-vocal",[185,165,156,190],false,5]]
 for(const [id,geo,steps,circular,n] of expected){const m=catalog.scales.find(s=>s.id===id);assert.ok(m);assert.equal(m.geo_id,geo);assert.deepEqual(m.intervals_cents,steps);assert.equal(m.circle_ready,circular);assert.equal(m.notes_count,n);assert.equal(m.reference_pitch_only,true);assert.ok(m.cultural_reuse_status);assert.deepEqual(rotateModel(m,1).intervals_cents,steps);assert.match(wheel(m,0,'Sharps','Major'),/REFERENCE/);assert.doesNotMatch(wheel(m,2.5,'Sharps','Major',modes[0]),/undefined|NaN/);if(m.source_reported_intervals_semitones)assert.deepEqual(steps,m.source_reported_intervals_semitones.map(x=>Math.round(x*100)))}
 const sp=catalog.scales.find(m=>m.id==='B23-TT-SOPRANO-OUTER');const hz=sp.source_frequencies_hz;assert.equal(hz.length,12);const p=hz.map(v=>Math.round(1200*Math.log2(v/hz[0])));assert.deepEqual(sp.intervals_cents,p.slice(1).map((v,i)=>v-p[i]));assert.equal(sp.reported_span_cents,p.at(-1));assert.equal(sp.circle_ready,false)
 const ni=catalog.scales.find(m=>m.id==='B23-NI-MARIMBA');assert.equal(ni.notes_count,ni.source_reported_key_count);assert.equal(ni.intervals_cents.reduce((a,b)=>a+b,0),3600)
 const ig=catalog.scales.find(m=>m.id==='B25-NG-UBOAKA-EZE');assert.equal(ig.source_reported_tine_count,ig.notes_count+1);assert.deepEqual(ig.intervals_cents,ig.source_semitone_positions.slice(1).map((v,i)=>100*(v-ig.source_semitone_positions[i])))
 const lt=catalog.scales.filter(m=>m.id.startsWith('B26-LT-CLUSTER-'));assert.deepEqual(lt.map(m=>m.source_cluster_number),[1,2,4,5,6,7]);assert.ok(lt.every(m=>!m.circle_ready&&m.notes_count===5));assert.equal(catalog.scales.filter(m=>/^B(23|24|25|26)-/.test(m.id)).length,14)
})

test('Follow-up source-specific pitch models preserve ranges and measured ratios',()=>{
 for(const [id,hz] of [
  ['B25-WA-DE482',[287,302,345,373,422,470,503,577]],
  ['B25-WA-DE493',[489,568,650,724,863,992]],
  ['B25-WA-DE589',[213,242,267,293,319,369,400,443]]
 ]){
  const m=catalog.scales.find(s=>s.id===id)
  assert.deepEqual(m.source_frequencies_hz,hz)
  assert.equal(m.circle_ready,false)
  assert.equal(m.notes_count,hz.length)
  const played=frequencies(m,0)
  hz.forEach((value,i)=>assert.ok(Math.abs(played[i]/played[0]-value/hz[0])<1e-10))
 }
 const siku=catalog.scales.find(s=>s.id==='B23-AR-SIKU')
 assert.deepEqual(siku.intervals_cents,[200,200,100,200,200,100,200,200,200,100,200,200])
 assert.equal(siku.circle_ready,false)
 const shakuhachi=catalog.scales.find(s=>s.id==='B26-JP-SHAKUHACHI')
 assert.deepEqual(shakuhachi.intervals_cents,[300,200,200,300,200])
 assert.equal(shakuhachi.circle_ready,true)
})


test('Batch 27 Mongolian pentatonic forms preserve the five theoretical octave species',()=>{
 const expected=[[200,200,300,200,300],[200,300,200,200,300],[200,300,200,300,200],[300,200,200,300,200],[300,200,300,200,200]];
 const region=catalog.regions.find(g=>g.id==='b27-mongolia');assert.deepEqual(region.country_iso3_for_navigation,['MNG']);
 const models=region.model_ids.map(id=>catalog.scales.find(m=>m.id===id));assert.deepEqual(models.map(m=>m.intervals_cents),expected);
 for(const m of models){assert.equal(m.notes_count,5);assert.equal(m.circle_ready,true);assert.equal(m.reference_pitch_only,true);assert.equal(m.intervals_cents.reduce((a,b)=>a+b,0),1200);assert.deepEqual(m.source_ids,["B27-MN-LUVSANGENDEN-2023","B27-MN-UNESCO-TRADITIONAL"]);assert.doesNotMatch(wheel(m,2.5,'Sharps','Major',modes[0]),/NaN|undefined/);}
})


test('Batches 28–30 preserve measured and nominal open-span inventories',()=>{
 const expected=[["B28-ID-BALI-A",[130,143,405,113],791],["B28-ID-BALI-B",[117,158,374,124],773],["B28-ID-BALI-C",[127,156,354,132],769],["B28-ID-BALI-D",[137,144,400,120],801],["B28-ID-BALI-E",[139,186,382,119],826],["B28-ID-BALI-F",[103,141,406,102],752],["B28-ID-BALI-G",[130,169,379,118],796],["B28-ID-BALI-H",[124,178,385,121],808],["B28-ID-BALI-I",[122,167,386,117],792],["B28-ID-BALI-J",[138,145,400,102],785],["B28-ID-BALI-K",[143,156,399,111],809],["B29-PH-TARAKA",[198,189,226,231,248,329,122],1543],["B29-PH-PRACTICE",[149,324,129,182,170,213,166],1333],["B30-FI-BRONZE",[200,200,100,200],700],["B30-FI-STEEL",[100,200,200,200],700]];
 for(const [id,intervals,span] of expected){const m=catalog.scales.find(s=>s.id===id);assert.deepEqual(m.intervals_cents,intervals);assert.equal(m.circle_ready,false);assert.equal(m.notes_count,intervals.length+1);assert.equal(m.reported_span_cents,span);assert.equal(m.reference_pitch_only,true);assert.doesNotMatch(wheel(m,2.5,'Sharps','Major',modes[0]),/NaN|undefined/);}
 assert.equal(catalog.regions.find(g=>g.id==='b28-bali').model_ids.length,11);assert.equal(catalog.regions.find(g=>g.id==='b29-maranao').model_ids.length,2);assert.equal(catalog.regions.find(g=>g.id==='b30-finland').model_ids.length,2);
});


test('Batches 31–38 preserve source-specific pitch inventories and attribution',()=>{
 const expected=[["B31-MW-BANGWE-01",[243,137,174,202,180,180,179,148,137,150,183],1913,["B31-MW-VAN-ZANTEN-1980"]],["B31-MW-BANGWE-02",[143,166,159,180,182,164,186,154,175,159,173,183],2024,["B31-MW-VAN-ZANTEN-1980"]],["B31-MW-BANGWE-03",[161,242,137,231,130,234,127,179,154,175],1770,["B31-MW-VAN-ZANTEN-1980"]],["B31-MW-BANGWE-04",[211,171,186,141,179,185,207,166,169,153],1768,["B31-MW-VAN-ZANTEN-1980"]],["B31-MW-BANGWE-05",[65,236,175,159,173,158,167,173,213,190,156],1865,["B31-MW-VAN-ZANTEN-1980"]],["B31-MW-BANGWE-06",[227,141,158,132,215,151,249,186,124,197,153,162],2095,["B31-MW-VAN-ZANTEN-1980"]],["B31-MW-BANGWE-07",[137,187,186,136,185,194,175,180],1380,["B31-MW-VAN-ZANTEN-1980"]],["B31-MW-BANGWE-08",[172,218,157,160,167,207,168,153],1402,["B31-MW-VAN-ZANTEN-1980"]],["B31-MW-BANGWE-09",[132,223,185,168,193,156,160],1217,["B31-MW-VAN-ZANTEN-1980"]],["B31-MW-VALIMBA-01",[154,242,151,155,157,233,126,186,187,187,197,151,159,170,149],2604,["B31-MW-VAN-ZANTEN-1980"]],["B31-MW-VALIMBA-02",[136,151,182,217,123,201,181,180,148,193,96,201],2009,["B31-MW-VAN-ZANTEN-1980"]],["B31-MW-VALIMBA-03",[218,132,180,146,118,215,191,148,181,201,163,165,151,139,177],2525,["B31-MW-VAN-ZANTEN-1980"]],["B31-MW-VALIMBA-04",[142,174,194,159,168,153,153,194,189,180,216,152,157,175,131,204,179],2920,["B31-MW-VAN-ZANTEN-1980"]],["B31-MW-VALIMBA-05",[98,146,118,215,216,147,178,199,161,179,204,183,119],2163,["B31-MW-VAN-ZANTEN-1980"]],["B31-MW-VALIMBA-06",[179,162,194,125,147,180,162,172,178,199,162,179,204,182,119],2544,["B31-MW-VAN-ZANTEN-1980"]],["B31-MW-VALIMBA-07",[131,143,171,190,171,163,225,165,177,193,152,94,172,278,123,147],2695,["B31-MW-VAN-ZANTEN-1980"]],["B31-MW-VALIMBA-08",[201,240,175,127,215,139,152,185,207,184,182,151,165,151,138],2612,["B31-MW-VAN-ZANTEN-1980"]],["B31-MW-VALIMBA-09",[166,243,150,188,310,228,137,206,184,183,151,191,124,116],2577,["B31-MW-VAN-ZANTEN-1980"]],["B31-MW-VALIMBA-10",[201,137,206,167,136,156,325,188,148,175,158,176,227,128,165,212],2905,["B31-MW-VAN-ZANTEN-1980"]],["B31-MW-VALIMBA-11",[193,173,176,160,193,173,80,198,199,197,160,162,148,110,103],2425,["B31-MW-VAN-ZANTEN-1980"]],["B31-MW-VALIMBA-12",[184,214,176,160,170,175,121,184,183,150,217,170],2104,["B31-MW-VAN-ZANTEN-1980"]],["B31-MW-VALIMBA-13",[198,178,161,130,153,215,165,175,180,201,181,147,208,160,169,112],2733,["B31-MW-VAN-ZANTEN-1980"]],["B31-MW-VALIMBA-14",[163,189,188,154,185,141,204,144,164,154,191,150,193,168,107,133],2628,["B31-MW-VAN-ZANTEN-1980"]],["B31-MW-VALIMBA-15",[255,173,202,168,153,184,147,154,241,124,170,155,165],2291,["B31-MW-VAN-ZANTEN-1980"]],["B31-MW-VALIMBA-16",[238,179,153,182,173,143,207,206,146,179,195,131,268,146],2546,["B31-MW-VAN-ZANTEN-1980"]],["B31-MW-VALIMBA-17",[244,174,138,248,142,201,179,141,151,266,136,96,258,128,96],2598,["B31-MW-VAN-ZANTEN-1980"]],["B32-CN-M341-2",[203,197,304,201,295,405],1605,["B32-CN-ZHANG-2004"]],["B32-CN-M282-20",[250,178,152,200,200,200,300],1480,["B32-CN-ZHANG-2004"]],["B32-CN-M253-4",[285,155,115,118,124,146,177,200],1320,["B32-CN-ZHANG-2004"]],["B33-UG-LUDAYA",[291,269,216,212,155,165,118,155],1581,["B33-UG-COOKE-1971"]],["B34-NO-HARDANGER-STANDARD",[500,700,700],1900,["B34-NO-HFAA"]],["B35-DM-M0293",[355,141,179,167,135,191],1168,["B35-SE-SUNDBERG-1969","B35-DAMUSC-2023"]],["B35-DM-M0294",[372,135,175,139,164,174],1159,["B35-SE-SUNDBERG-1969","B35-DAMUSC-2023"]],["B35-DM-M0141",[154,189,154,200,211,134,103,93,160,170,161,206,189,165,61,129],2479,["B36-CN-RAO-1987","B35-DAMUSC-2023"]],["B35-DM-M0142",[158,180,357,201,246,93,164,165,362,192,159,181],2458,["B36-CN-RAO-1987","B35-DAMUSC-2023"]],["B35-DM-M0143",[149,190,353,192,215,87,148,217,302,194,148,483],2678,["B36-CN-RAO-1987","B35-DAMUSC-2023"]],["B35-DM-M0144",[124,215,318,196,205,101,184,183,318,194,166,464],2668,["B36-CN-RAO-1987","B35-DAMUSC-2023"]],["B35-DM-M0279",[170,148,154,195,187,201,140],1195,["B36-CN-THRASHER-1978","B35-DAMUSC-2023"]],["B35-DM-M0280",[170,148,154,195,187,136,204],1194,["B36-CN-THRASHER-1978","B35-DAMUSC-2023"]],["B35-DM-M0281",[177,160,158,161,189,126,209],1180,["B36-CN-THRASHER-1978","B35-DAMUSC-2023"]],["B35-DM-M0282",[151,152,148,177,198,160,214],1200,["B36-CN-THRASHER-1978","B35-DAMUSC-2023"]],["B35-DM-M0283",[200,175,110,195,195,110,215],1200,["B36-CN-THRASHER-1978","B35-DAMUSC-2023"]],["B35-DM-M0217",[121,306,324,216,297,178,231,288,264,289,289,105,284,232,322,255,110,292,226,228],4857,["B37-BF-STRAND-2009","B35-DAMUSC-2023"]],["B35-DM-M0218",[144,188,201,178,273,301,295,233,156,280,275,269,243,146,268,259,283,239,141,281,198,157],5008,["B37-BF-STRAND-2009","B35-DAMUSC-2023"]],["B35-DM-M0219",[198,260,123,223,269,323,211,379,88,295,180,482,302,91,371,185,281,230,131,297,136,267],5322,["B37-BF-STRAND-2009","B35-DAMUSC-2023"]],["B35-DM-M0189",[689,245,257,368,329,246,253,206,181,260,83,253,213,231,92,718],4624,["B38-TZ-KUBIK-1984","B35-DAMUSC-2023"]]];
 for(const [id,iv,span,sources] of expected){const m=catalog.scales.find(s=>s.id===id);assert.deepEqual(m.intervals_cents,iv);assert.equal(m.reported_span_cents,span);assert.deepEqual(m.source_ids,sources);assert.equal(m.reference_pitch_only,true);assert.doesNotMatch(wheel(m,2.5,'Sharps','Major',modes[0]),/NaN|undefined/);if(m.source_frequencies_hz){const p=m.source_frequencies_hz.map(v=>Math.round(1200*Math.log2(v/m.source_frequencies_hz[0])));assert.deepEqual(iv,p.slice(1).map((v,i)=>v-p[i]));}if(m.source_database_id){assert.ok(m.audit_status.includes('primary numerical recheck pending'));assert.ok(sources.includes('B35-DAMUSC-2023'));}}
 assert.equal(expected.length,46);
});


test('Batches 39–45 preserve priority-region theoretical and nominal inventories',()=>{
 const expected=[["B39-BG-HICAZ",[100,300,100,200,100,200,200],1200,["B39-BG-KIRILOV-2021"]],["B39-BG-KARCIGAR",[200,100,200,100,300,100,200],1200,["B39-BG-KIRILOV-2021"]],["B39-BG-MUSTEAR",[200,100,300,100,200,100,200],1200,["B39-BG-KIRILOV-2021"]],["B39-BG-HUZZAM",[200,100,100,300,100,200,200],1200,["B39-BG-KIRILOV-2021"]],["B39-BG-SULTANI-YEGAH",[200,100,200,200,100,300,100],1200,["B39-BG-KIRILOV-2021"]],["B39-BG-SUZINAK",[200,200,100,200,100,300,100],1200,["B39-BG-KIRILOV-2021"]],["B39-BG-HICAZKAR",[100,300,100,200,100,300,100],1200,["B39-BG-KIRILOV-2021"]],["B40-KG-MAJOR",[500,200,200,100],1000,["B40-KG-SIPOS-2014"]],["B40-KG-MINOR",[500,100,200,200],1000,["B40-KG-SIPOS-2014"]],["B41-KZ-CORE",[200,200],400,["B41-KZ-SIPOS-2001"]],["B41-KZ-DIATONIC",[200,100,200,200,100,200,200],1200,["B41-KZ-SIPOS-2001"]],["B42-AM-CONJUNCT",[200,200,100,200,200,100,200,200,100],1500,["B42-AM-CROWLEY-GOMEZ-2025","B42-AM-AVC"]],["B43-RO-NAI-20",[100,200,200,200,100,200,200,100,200,200,200,100,200,200,100,200,200,200,100],3200,["B43-RO-PIMENTEL-2009"]],["B44-VE-CUATRO",[200,300,400],900,["B44-VE-TUCUATRO","B44-VE-AMEDIOTONO"]],["B44-AN-CHARANGO",[300,200,300,400],1200,["B44-AN-VETTER-CHARANGO"]],["B45-HI-HIGH-G",[400,300,200],900,["B45-HI-UKULELE-CLASSROOM","B45-HI-NELSON"]],["B45-HI-LOW-G",[500,400,500],1400,["B45-HI-UKULELE-CLASSROOM","B45-HI-NELSON"]]];
 for(const [id,iv,span,sources] of expected){const m=catalog.scales.find(s=>s.id===id);assert.deepEqual(m.intervals_cents,iv);assert.equal(m.reported_span_cents,span);assert.deepEqual(m.source_ids,sources);assert.equal(m.reference_pitch_only,true);assert.doesNotMatch(wheel(m,2.5,'Sharps','Major',modes[0]),/NaN|undefined/);}
 assert.equal(expected.length,17);
 const am=catalog.scales.find(m=>m.id==='B42-AM-CONJUNCT');assert.equal(am.circle_ready,false);assert.equal(am.reported_span_cents,1500);assert.equal(am.notes_count,10);
 const nai=catalog.scales.find(m=>m.id==='B43-RO-NAI-20');assert.equal(nai.notes_count,20);assert.equal(nai.source_pitch_midi.length,20);
});
