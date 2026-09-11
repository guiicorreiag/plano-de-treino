import { seedExercises, seedWorkouts } from '../data/seedData'

export type Phase = 'adaptation' | 'consolidation'
export type Item = { key:string; name:string; category:string; sets:number; min?:number; max?:number; seconds?:number; rest:number; restMax:number; notes:string }
export type Plan = { code:string; name:string; day:number; optional:boolean; version:string; items:Item[] }
export type SetLog = { weight:string; reps:string; seconds:string; rpe:string; done:boolean; pain?:string; response?:string; technique?:string; amplitude?:string; note?:string }
export type Symptoms = { pain:string; change:string; neuro:string; urgent:string; energy?:string; recovery?:string; quality?:string; note?:string }
export type Workout = { id:string; plan:Plan; phase:Phase; start:string; end?:string; status:'active'|'completed'|'cancelled'; eligible:boolean; logs:Record<string,SetLog>; deferred:string[]; pre:Symptoms; post:Symptoms; rpeTarget:string; partial?:boolean; legacy?:boolean }
export type Settings = { phase:Phase; checkpoint:number; reviews:{at:string; count:number; ready:boolean}[] }
export const initialSettings:Settings = {phase:'adaptation',checkpoint:12,reviews:[]}
export const emptySymptoms=():Symptoms=>({pain:'',change:'',neuro:'',urgent:'',energy:'',recovery:'',quality:'',note:''})
export const emptySet=():SetLog=>({weight:'',reps:'',seconds:'',rpe:'',done:false})
export const num=(s:string|undefined)=>s?.trim()?Number(s):null
export const stage=(count:number)=>Math.min(4,Math.floor(Math.max(0,count)/3)+1)
export const rpeTarget=(count:number)=>['5–6','5–6,5','6–7','6–7'][stage(count)-1]
export const countAdaptation=(sessions:Workout[])=>new Set(sessions.filter(s=>s.status==='completed'&&s.eligible&&!s.plan.optional&&s.phase==='adaptation').map(s=>s.id)).size
export const hasRedFlag=(s:Symptoms)=>s.neuro==='yes'||s.urgent==='yes'
export const canAdvance=(count:number,checkpoint:number,recovered:string,stable:string,technique:string,noSymptoms:string)=>count>=checkpoint&&[recovered,stable,technique,noSymptoms].every(x=>x==='yes')
export const keyFor=(item:Item,n:number)=>`${item.key}:${n}`
export const isCardio=(i:Item)=>['cardio','aquecimento'].includes(i.category)
export function validSet(item:Item,s:SetLog){
 const reps=num(s.reps),seconds=num(s.seconds),weight=num(s.weight),rpe=num(s.rpe),pain=num(s.pain)
 return (item.seconds?seconds!==null&&Number.isInteger(seconds)&&seconds>0&&seconds<=86400:reps!==null&&Number.isInteger(reps)&&reps>0&&reps<=1000)&&
  (weight===null||Number.isFinite(weight)&&weight>=0&&weight<=2000)&&(rpe===null||Number.isFinite(rpe)&&rpe>=0&&rpe<=10)&&(pain===null||Number.isFinite(pain)&&pain>=0&&pain<=10)
}
export function fullyCompleted(w:Workout){return w.plan.items.filter(i=>!isCardio(i)).every(i=>Array.from({length:i.sets},(_,n)=>w.logs[keyFor(i,n)]?.done).every(Boolean))&&w.plan.items.some(i=>!isCardio(i))}
export function cardioMinutes(w:Workout){return w.plan.items.filter(i=>i.category==='cardio').reduce((sum,i)=>sum+Array.from({length:i.sets},(_,n)=>w.logs[keyFor(i,n)]).reduce((n,s)=>n+(s?.done?Number(s.seconds||0)/60:0),0),0)}
export function prescription(i:Item){return `${i.sets} × ${i.seconds?(i.seconds<60?`${i.seconds} s`:`${Math.floor(i.seconds/60)} min${i.seconds%60?` ${i.seconds%60} s`:''}`):`${i.min}–${i.max} reps`}`}
export function weekStart(now=new Date()){const local=new Date(now.toLocaleString('en-US',{timeZone:'America/Sao_Paulo'}));local.setDate(local.getDate()-((local.getDay()+6)%7));return `${local.getFullYear()}-${String(local.getMonth()+1).padStart(2,'0')}-${String(local.getDate()).padStart(2,'0')}`}
export function localDate(s:string){return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(s))}
function item(name:string):Item{
 const raw=seedWorkouts.flatMap(w=>w.exercises).find(x=>x.exercise===name)!
 const info=seedExercises.find(x=>x.name===name)!
 return {key:name,name,category:info.category,sets:raw.sets,min:raw.repsMin,max:raw.repsMax,seconds:raw.durationSeconds,rest:raw.restSeconds,restMax:raw.restSecondsMax??raw.restSeconds,notes:[info.instructions,info.safetyNotes,raw.safetyNotes,raw.notes].filter(Boolean).join(' ')}
}
export function plans(phase:Phase):Plan[]{
 const warm=item('Esteira ou bicicleta'),cardio={...item('Cardio leve/moderado'),seconds:600,notes:'10–15 minutos confortáveis, conforme recuperação. Sem HIIT.'}
 const build=(code:string,name:string,day:number,optional:boolean,names:string[]):Plan=>({code,name,day,optional,version:phase==='adaptation'?'readaptacao_3dias_v1':'consolidacao_3dias_v1',items:[...(optional?[]:[warm]),...names.map(item),{...cardio,seconds:optional?1200:600,notes:optional?'20–30 minutos confortáveis. Reduza ou descanse se prejudicar a recuperação.':cardio.notes}]})
 const result=[
  build('A','Corpo inteiro · ênfase superior',1,false,['Chest press / supino máquina','Puxada frontal','Leg press 90° ou 45°','Mesa ou cadeira flexora','Pallof press']),
  build('B','Complementos leves + core',2,false,['Elevação lateral','Rosca direta na polia','Tríceps corda','Panturrilha em máquina ou leg press','Bird-dog']),
  build('C','Corpo inteiro · ênfase inferior',3,false,['Leg press 90° ou 45°','Elevação pélvica máquina','Mesa ou cadeira flexora','Supino inclinado máquina','Remada articulada com apoio de peito','Pallof press']),
  build('Extra 1','Cardio leve',4,true,[]),
  build('Extra 2','Cardio + complementos leves',5,true,['Face pull','Prancha lateral modificada'])
 ]
 if(phase==='consolidation'){
  // Same tolerated movements; modest rep-range change, never an automatic weight increase.
  result.forEach(p=>{p.name=`${p.name} · consolidação`;p.items=p.items.map(i=>!isCardio(i)&&i.category!=='core'?{...i,min:i.min===10?10:12,max:i.min===10?14:16,notes:`${i.notes} Consolidação: mantenha a carga inicial. Aumente repetições apenas com recuperação, técnica e sintomas estáveis.`}:i)})
 }
 return result
}
