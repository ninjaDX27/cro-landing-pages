const finite = v => typeof v === 'number' && Number.isFinite(v);
export function monthlyPayment(principal, annualRate, months) {
  if(!finite(principal)||principal<0||!finite(annualRate)||annualRate<0||annualRate>30||!Number.isInteger(months)||months<1||months>600)throw new Error('Invalid loan parameters');
  if(principal===0)return 0;
  const r=annualRate/1200;
  return r===0?principal/months:principal*r/(-Math.expm1(-months*Math.log1p(r)));
}
export function remainingBalance(principal,annualRate,months,paidMonths) {
  if(!Number.isInteger(paidMonths)||paidMonths<0||paidMonths>months)throw new Error('Invalid elapsed period');
  const payment=monthlyPayment(principal,annualRate,months);
  if(paidMonths===months)return 0;
  const r=annualRate/1200;
  if(r===0)return Math.max(0,principal-payment*paidMonths);
  const growth=Math.expm1(paidMonths*Math.log1p(r));
  return Math.max(0,principal*(growth+1)-payment*growth/r);
}
export function validateProfile(profile) {
  const errors=[];
  const bounds={loanAmount:[1000,3000000],propertyPrice:[1000,5000000],valuation:[1000,5000000],netIncome:[1,1000000],otherDebt:[0,1000000],euribor:[0,15]};
  for(const [key,[min,max]] of Object.entries(bounds))if(!finite(profile[key])||profile[key]<min||profile[key]>max)errors.push(key);
  if(!Number.isInteger(profile.loanYears)||profile.loanYears<1||profile.loanYears>40)errors.push('loanYears');
  return errors;
}
export function isUsableOffer(offer,{mode='demo',now=Date.now()}={}) {
  const positive=['fixed_term_years','max_ltv','max_dsti','max_term_years'];
  if(!offer||typeof offer.bank_id!=='string'||!offer.bank_id||typeof offer.bank_name!=='string'||typeof offer.product_name!=='string'||offer.rate_type!=='Mista'||positive.some(k=>!finite(offer[k])||offer[k]<=0)||!finite(offer.fixed_rate)||offer.fixed_rate<0||offer.fixed_rate>30||!finite(offer.spread_min)||offer.spread_min<0||offer.spread_min>15)return false;
  if(!Number.isInteger(offer.fixed_term_years)||offer.max_ltv>100||offer.max_dsti>100||offer.max_term_years>50)return false;
  if(mode==='demo')return offer.is_demo===true&&offer.verification_status==='demo';
  if(mode!=='verified'||offer.is_demo!==false||offer.verification_status!=='verified')return false;
  const verified=Date.parse(offer.verified_at),until=Date.parse(offer.valid_until);
  let source;try{source=new URL(offer.source_url);}catch{return false;}
  return source.protocol==='https:'&&Number.isFinite(verified)&&verified<=now&&now-verified<=7*86400000&&Number.isFinite(until)&&until>now&&finite(offer.taeg)&&offer.taeg>=0&&finite(offer.mtic_eur)&&offer.mtic_eur>0;
}
export function compareOffers(profile,offers,{mode='demo',now=Date.now(),sort='initial'}={}) {
  const errors=validateProfile(profile);if(errors.length)throw new Error('Invalid inputs: '+errors.join(', '));
  const ltv=100*profile.loanAmount/Math.min(profile.propertyPrice,profile.valuation);
  const results=[];const seen=new Set();
  for(const offer of offers){
    if(!isUsableOffer(offer,{mode,now})||seen.has(offer.bank_id))continue;seen.add(offer.bank_id);
    const totalMonths=profile.loanYears*12,fixedMonths=Math.min(offer.fixed_term_years*12,totalMonths);
    const initial=monthlyPayment(profile.loanAmount,offer.fixed_rate,totalMonths);
    const balance=remainingBalance(profile.loanAmount,offer.fixed_rate,totalMonths,fixedMonths);
    const after=fixedMonths===totalMonths?null:monthlyPayment(balance,profile.euribor+offer.spread_min,totalMonths-fixedMonths);
    const dsti=100*(initial+profile.otherDebt)/profile.netIncome;
    const scenarioDsti=after===null?dsti:100*(after+profile.otherDebt)/profile.netIncome;
    if(ltv<=offer.max_ltv&&Math.max(dsti,scenarioDsti)<=offer.max_dsti&&profile.loanYears<=offer.max_term_years)results.push({...offer,ltv,initialPayment:initial,afterFixedPayment:after,dsti,scenarioDsti,remainingPrincipal:balance,fixedMonths});
  }
  return results.sort((a,b)=>(sort==='after'?(a.afterFixedPayment??a.initialPayment)-(b.afterFixedPayment??b.initialPayment):a.initialPayment-b.initialPayment)||a.bank_id.localeCompare(b.bank_id)).slice(0,3);
}
