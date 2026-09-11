import { supabase } from '../lib/supabase'
export type Kind='session'|'settings'|'checkin'|'measurement'
export type LocalRecord={key:string;id:string;user:string;kind:Kind;payload:any;revision:number;mutation:string;dirty:boolean;conflict?:any;error?:string}
let database:Promise<IDBDatabase>|undefined
function db(){return database??=new Promise<IDBDatabase>((resolve,reject)=>{const r=indexedDB.open('training-tracker-v3',1);r.onupgradeneeded=()=>r.result.createObjectStore('records',{keyPath:'key'});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
const notify=()=>window.dispatchEvent(new Event('tracker-change'))
export async function allRecords(user:string):Promise<LocalRecord[]>{const d=await db();return new Promise((resolve,reject)=>{const r=d.transaction('records').objectStore('records').getAll();r.onsuccess=()=>resolve(r.result.filter((x:LocalRecord)=>x.user===user));r.onerror=()=>reject(r.error)})}
async function update(user:string,id:string,fn:(old:LocalRecord|undefined)=>LocalRecord|undefined){const d=await db();await new Promise<void>((resolve,reject)=>{const t=d.transaction('records','readwrite'),s=t.objectStore('records'),r=s.get(`${user}:${id}`);r.onsuccess=()=>{const next=fn(r.result);if(next)s.put(next)};t.oncomplete=()=>resolve();t.onerror=()=>reject(t.error);t.onabort=()=>reject(t.error)});notify()}
export async function putRecord(user:string,id:string,kind:Kind,payload:any){await update(user,id,old=>({key:`${user}:${id}`,id,user,kind,payload:structuredClone(payload),revision:old?.revision??0,mutation:crypto.randomUUID(),dirty:true,conflict:old?.conflict}));}
export async function importLegacy(user:string,id:string,payload:any,kind:Kind='session'){await update(user,id,old=>old??{key:`${user}:${id}`,id,user,kind,payload,revision:0,mutation:crypto.randomUUID(),dirty:false})}
export async function resolveConflict(user:string,id:string,choice:'local'|'remote'){
 await update(user,id,old=>{if(!old?.conflict)return old;const remote=old.conflict;return {...old,payload:choice==='remote'?remote.payload:old.payload,revision:remote.revision,mutation:choice==='remote'?remote.mutation_id:crypto.randomUUID(),dirty:choice==='local',conflict:undefined,error:undefined}})
}
const active=new Map<string,Promise<void>>()
export async function syncRecords(user:string){
 if(!supabase||!navigator.onLine)return
 const running=active.get(user);if(running)return running
 const work=async()=>{
  for(const record of await allRecords(user)){
   if(!record.dirty||record.conflict)continue
   const {data,error}=await supabase!.rpc('save_tracker_record',{record_id:record.id,record_kind:record.kind,record_payload:record.payload,expected_revision:record.revision,request_id:record.mutation})
   if(error){
    if(error.message.includes('REVISION_CONFLICT')){
     const remote=await supabase!.from('tracker_records').select('*').eq('user_id',user).eq('id',record.id).single()
     if(remote.error)throw remote.error
     await update(user,record.id,old=>old?{...old,conflict:remote.data}:old)
     continue
    }
    throw error
   }
   await update(user,record.id,old=>old?{...old,revision:Number(data),dirty:old.mutation!==record.mutation,error:undefined}:old)
  }
  let offset=0
  for(;;){
   const {data,error}=await supabase!.from('tracker_records').select('*').eq('user_id',user).order('id').range(offset,offset+499)
   if(error)throw error
   for(const remote of data??[])await update(user,remote.id,old=>{
    if(old?.dirty){
     if(old.mutation===remote.mutation_id)return {...old,revision:remote.revision,dirty:false,conflict:undefined}
     return remote.revision!==old.revision?{...old,conflict:remote}:old
    }
    return {key:`${user}:${remote.id}`,id:remote.id,user,kind:remote.kind,payload:remote.payload,revision:remote.revision,mutation:remote.mutation_id,dirty:false}
   })
   if(!data||data.length<500)break;offset+=500
  }
 }
 const promise=(navigator.locks?navigator.locks.request(`training-sync-${user}`,work):work()).finally(()=>active.delete(user))
 active.set(user,promise);return promise
}
export async function exportBackup(user:string){return {format:'training-tracker-v3',createdAt:new Date().toISOString(),records:await allRecords(user)}}
