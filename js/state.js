/* ══════════════════════════════════════════════════════
   GLOBAL STATE
══════════════════════════════════════════════════════ */
const S = {
  age:null,gender:null,height:null,weight:null,
  activity:null,actMult:1.55,
  goal:0,goalLabel:'Maintain',
  diet:null,pantry:[],
  targetWeight:null,pace:.5,
  reminders:{breakfast:'08:00',lunch:'13:00',dinner:'19:00',workout:'07:00',workoutDays:4,waterInterval:60},
  enabled:{breakfast:false,lunch:false,dinner:false,workout:false,water:false}
};

let step = 1;
const STEPS = 6;
let remLoop = null, waterLoop = null;
let chatHist = [];
let bodyB64 = null, skinB64 = null;
let bodyStream = null, skinStream = null;
