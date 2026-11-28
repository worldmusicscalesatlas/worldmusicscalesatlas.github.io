// Only locations with actual playable catalog records may enter public navigation.
export function playableRegions(regions, models) {
 const byId=new Map(models.map(m=>[m.id,m]))
 return regions.filter(g=>g.coverage_status!=='context_only'&&g.model_ids.some(id=>byId.get(id)?.geo_id===g.id))
}
export const coverageLabel=g=>g.model_ids.length+' models'
