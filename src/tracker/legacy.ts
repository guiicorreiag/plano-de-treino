import { supabase } from '../lib/supabase'
import { emptySymptoms, type Item, type Workout } from './model'
import { importLegacy } from './store'
export async function loadLegacy(user:string){
 if(!supabase)return
 const {data,error}=await supabase.from('workout_sessions').select('*,workout_templates(code,name,weekday,is_optional,workout_exercises(*,exercises(name,category,instructions,safety_notes))),exercise_sets(*,exercises(name,category)),cardio_sessions(*)').eq('user_id',user).is('deleted_at',null).order('started_at')
 if(error)throw error
 const [measurements,checkins]=await Promise.all([
  supabase.from('body_measurements').select('*').eq('user_id',user).is('deleted_at',null),
  supabase.from('weekly_checkins').select('*').eq('user_id',user).is('deleted_at',null)
 ])
 if(measurements.error)throw measurements.error
 if(checkins.error)throw checkins.error
 for(const m of measurements.data??[])await importLegacy(user,m.id,{date:m.measured_at,weight:String(m.weight_kg??''),waist:String(m.waist_cm??''),note:m.notes??'',legacy:true},'measurement')
 for(const c of checkins.data??[])await importLegacy(user,c.id,{week:c.week_start,values:{weight:String(c.weight_kg??''),waist:String(c.waist_cm??''),sleep:String(c.sleep_quality??''),energy:String(c.energy??''),recovery:String(c.muscle_recovery??''),stress:String(c.stress??''),pain:String(c.average_lumbar_pain??''),steps:String(c.average_steps??''),notes:c.comments??''},legacy:true},'checkin')
 for(const s of data??[]){
  const template=s.workout_templates
  if(!template)continue
  const items:Item[]=(template.workout_exercises??[]).filter((x:any)=>!x.deleted_at).sort((a:any,b:any)=>a.sort_order-b.sort_order).map((x:any)=>({key:x.id,name:x.exercises?.name??'Exercício',category:x.exercises?.category??'outro',sets:x.target_sets,min:x.target_reps_min,max:x.target_reps_max,seconds:x.target_duration_seconds,rest:x.rest_seconds_min??x.rest_seconds??60,restMax:x.rest_seconds_max??90,notes:[x.notes,x.safety_notes,x.exercises?.instructions,x.exercises?.safety_notes].filter(Boolean).join(' ')}))
  const logs:Workout['logs']={}
  for(const set of (s.exercise_sets??[]).filter((x:any)=>!x.deleted_at)){
   let i=items.find(i=>i.key===set.workout_exercise_id)
   if(!i){i={key:set.exercise_id,name:set.exercises?.name??'Exercício registrado',category:set.exercises?.category??'outro',sets:set.set_number,min:10,max:12,rest:60,restMax:90,notes:'Registro histórico'};items.push(i)}
   i.sets=Math.max(i.sets,set.set_number)
   logs[`${i.key}:${set.set_number-1}`]={weight:String(set.weight_kg??''),reps:String(set.repetitions??''),seconds:String(set.duration_seconds??''),rpe:String(set.rpe??''),pain:String(set.pain_during??''),done:!!set.completed_at,note:set.notes??''}
  }
  for(const c of (s.cardio_sessions??[]).filter((x:any)=>!x.deleted_at)){
   // Prefer explicit cardio rows if the old app also saved cardio as an exercise set.
   for(const i of items.filter(i=>i.category==='cardio'))delete logs[`${i.key}:0`]
   const key=`cardio-${c.id}`;items.push({key,name:c.modality,category:'cardio',sets:1,seconds:Math.round(c.duration_minutes*60),rest:0,restMax:0,notes:'Cardio histórico'});logs[`${key}:0`]={weight:'',reps:'',seconds:String(c.duration_minutes*60),rpe:String(c.perceived_exertion??''),done:true}
  }
  const w:Workout={id:s.id,plan:{code:template.code,name:template.name,day:template.weekday,optional:template.is_optional,version:s.plan_version??'historico',items},phase:'adaptation',start:s.started_at,end:s.completed_at,status:s.status==='completed'?'completed':s.status==='in_progress'?'active':'cancelled',eligible:s.status==='completed'&&!template.is_optional&&(s.exercise_sets??[]).some((x:any)=>!x.deleted_at&&x.completed_at&&x.exercises?.category!=='cardio'&&x.exercises?.category!=='aquecimento'&&(x.repetitions>0||x.duration_seconds>0)),logs,deferred:[],pre:{...emptySymptoms(),pain:String(s.pain_before??''),energy:String(s.energy_before??'')},post:{...emptySymptoms(),neuro:(s.radiating_pain||s.tingling||s.numbness||s.weakness)?'yes':'',change:s.pain_character_changed?'yes':'',pain:String(s.pain_after??''),quality:String(s.workout_quality??''),note:s.notes??''},rpeTarget:'5–7',legacy:true}
  // Keep unsent drafts from the previous interface when upgrading on the same device.
  try{const old=JSON.parse(localStorage.getItem('training.active')??'null');if(old?.userId===user&&old.id===s.id&&w.status==='active')for(const [key,value] of Object.entries(old.drafts??{})){const d=value as any;const split=key.lastIndexOf(':');logs[`${key.slice(0,split)}:${Number(key.slice(split+1))-1}`]={weight:d.weight??'',reps:d.reps??'',seconds:d.duration??'',rpe:d.rpe??'',pain:d.pain??'',done:!!d.saved}}}catch{/* Invalid legacy drafts never erase database records. */}
  await importLegacy(user,s.id,w)
 }
}
