import 'fake-indexeddb/auto'
import {beforeEach,describe,expect,it,vi} from 'vitest'
const state=vi.hoisted(()=>({cloud:new Map<string,any>(),fail:false,afterWrite:null as null|(()=>Promise<void>)}))
vi.mock('../lib/supabase',()=>({supabase:{rpc:async(_name:string,a:any)=>{
 if(state.fail)return {data:null,error:{message:'Network unavailable'}}
 const old=state.cloud.get(a.record_id)
 if(old?.mutation_id===a.request_id)return {data:old.revision,error:null}
 if((old?.revision??0)!==a.expected_revision)return {data:null,error:{message:'REVISION_CONFLICT'}}
 const row={id:a.record_id,kind:a.record_kind,payload:a.record_payload,revision:a.expected_revision+1,mutation_id:a.request_id};state.cloud.set(a.record_id,row)
 if(state.afterWrite){const cb=state.afterWrite;state.afterWrite=null;await cb()}
 return {data:row.revision,error:null}
},from:()=>{let id:string|undefined;const q:any={select:()=>q,eq:(field:string,value:string)=>{if(field==='id')id=value;return q},order:()=>q,range:async()=>({data:[...state.cloud.values()],error:null}),single:async()=>({data:state.cloud.get(id!),error:null})};return q}}}))
import {allRecords,putRecord,syncRecords,resolveConflict} from './store'
beforeEach(()=>{state.cloud.clear();state.fail=false;state.afterWrite=null})
describe('fila durável por usuário',()=>{
 it('mantém edição offline e sincroniza sem duplicação após falha',async()=>{const u=crypto.randomUUID(),id=crypto.randomUUID();await putRecord(u,id,'session',{reps:10});state.fail=true;await expect(syncRecords(u)).rejects.toBeTruthy();expect((await allRecords(u))[0].dirty).toBe(true);expect((await allRecords('other-account')).length).toBe(0);await putRecord(u,id,'session',{reps:12});state.fail=false;await syncRecords(u);await syncRecords(u);expect(state.cloud.size).toBe(1);expect((await allRecords(u))[0].payload.reps).toBe(12);expect((await allRecords(u))[0].dirty).toBe(false)})
 it('não perde edição feita enquanto um envio está em andamento',async()=>{const u=crypto.randomUUID(),id=crypto.randomUUID();await putRecord(u,id,'session',{reps:10});state.afterWrite=()=>putRecord(u,id,'session',{reps:11});await syncRecords(u);expect((await allRecords(u))[0].dirty).toBe(true);expect((await allRecords(u))[0].payload.reps).toBe(11);await syncRecords(u);expect(state.cloud.get(id).payload.reps).toBe(11)})
 it('identifica conflito e exige escolha explícita',async()=>{const u=crypto.randomUUID(),id=crypto.randomUUID();await putRecord(u,id,'session',{reps:10});await syncRecords(u);await putRecord(u,id,'session',{reps:11});const remote=state.cloud.get(id);state.cloud.set(id,{...remote,payload:{reps:14},revision:2,mutation_id:crypto.randomUUID()});await syncRecords(u);expect((await allRecords(u))[0].conflict.payload.reps).toBe(14);expect(state.cloud.get(id).payload.reps).toBe(14);await resolveConflict(u,id,'local');await syncRecords(u);expect(state.cloud.get(id).payload.reps).toBe(11)})
 it('repete com segurança quando a resposta se perde depois da gravação',async()=>{const u=crypto.randomUUID(),id=crypto.randomUUID();await putRecord(u,id,'session',{done:true});state.afterWrite=async()=>{throw Error('lost response')};await expect(syncRecords(u)).rejects.toThrow();await syncRecords(u);expect(state.cloud.get(id).revision).toBe(1);expect((await allRecords(u))[0].dirty).toBe(false)})
})
