/* ══════════════════════════════════════════════════════
   CALCULATIONS
══════════════════════════════════════════════════════ */
const bmi   = () => S.weight / Math.pow(S.height/100, 2);
const bmr   = () => S.gender==='Male'
  ? (10*S.weight)+(6.25*S.height)-(5*S.age)+5
  : S.gender==='Female'
    ? (10*S.weight)+(6.25*S.height)-(5*S.age)-161
    : (10*S.weight)+(6.25*S.height)-(5*S.age)-78;
const tdee  = () => bmr() * S.actMult;
const daily = () => tdee() + S.goal;

function macros() {
  const c = daily();
  const sp = S.goal<0 ? {p:.35,c:.40,f:.25} : S.goal>0 ? {p:.30,c:.50,f:.20} : {p:.25,c:.50,f:.25};
  return {
    protein: Math.round(c*sp.p/4),
    carbs:   Math.round(c*sp.c/4),
    fat:     Math.round(c*sp.f/9)
  };
}

function bmiCat(b) {
  if(b<18.5) return {label:'Underweight',color:'#3b82f6'};
  if(b<25)   return {label:'Normal',     color:'#00e5c0'};
  if(b<30)   return {label:'Overweight', color:'#ffc107'};
  return           {label:'Obese',       color:'#ff4d6d'};
}

function timeline() {
  const diff = Math.abs(S.weight - S.targetWeight);
  const weeks = Math.ceil(diff / S.pace);
  const months = (weeks/4.33).toFixed(1);
  const end = new Date(); end.setDate(end.getDate()+weeks*7);
  return {diff,weeks,months,end};
}
