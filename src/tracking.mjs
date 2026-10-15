const allowed=new Set(['scenario_compared','proposal_request_prepared']);
export function trackInteraction(name,{consent=false,variant='a',dataLayer=[],uuid=()=>crypto.randomUUID()}={}){
  if(!allowed.has(name))throw new Error('Unsupported event');
  if(!consent)return false;
  dataLayer.push({event:name,event_id:uuid(),experiment_id:'mortgage-clarity-01',experiment_variant:variant==='b'?'b':'a'});
  return true;
}
