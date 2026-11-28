// Public contextual resources are not tuning models or cultural reuse permissions.
export function coverageInfo(group, models, sources) {
 if(models.length)return {text:'',links:[]}
 const text=group.coverage_note?'Context only — no playable tuning published. '+group.coverage_note:'Research coverage only. No numerical tuning is available yet.'
 const links=(group.context_source_ids||[]).map(id=>sources.find(s=>s.id===id)).filter(s=>s&&/^https?:\/\//i.test(s.url)).map(s=>({url:s.url,label:s.public_label||s.citation}))
 return {text,links}
}
export const coverageLabel=g=>g.model_ids.length?g.model_ids.length+' models':g.coverage_status==='context_only'?'context only':'research pending'
