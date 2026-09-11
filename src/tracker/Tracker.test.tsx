import 'fake-indexeddb/auto'
import React from 'react'
import {cleanup,fireEvent,render,screen,waitFor,within} from '@testing-library/react'
import {afterEach,describe,it,expect,vi} from 'vitest'
vi.mock('../lib/supabase',()=>({supabase:null}))
import {HomePage} from './Tracker'
import {allRecords} from './store'
afterEach(cleanup)
describe('uso durante o treino',()=>{
 it('registra exercício fora da ordem e retoma após remontar o app',async()=>{
  const user={id:crypto.randomUUID(),email:'test@example.invalid'} as any
  const view=render(<HomePage user={user} onSignOut={async()=>{}}/>);
  await screen.findByRole('button',{name:'Treinos'});fireEvent.click(screen.getByRole('button',{name:'Treinos'}))
  const card=screen.getByRole('heading',{name:'A · Corpo inteiro · ênfase superior'}).closest('section')!
  fireEvent.click(within(card).getByRole('button',{name:'Iniciar este treino'}));fireEvent.click(screen.getByRole('button',{name:'Começar treino'}))
  await screen.findByRole('heading',{name:'Puxada frontal'})
  const exercise=screen.getByRole('heading',{name:'Puxada frontal'}).closest('section')!
  fireEvent.change(within(exercise).getAllByLabelText('kg')[0],{target:{value:'30'}})
  fireEvent.change(within(exercise).getAllByLabelText('reps')[0],{target:{value:'12'}})
  fireEvent.click(within(exercise).getByRole('button',{name:'Concluir série 1 de Puxada frontal'}))
  await waitFor(async()=>{const r=await allRecords(user.id);expect(r[0].payload.logs['Puxada frontal:0'].done).toBe(true)})
  view.unmount();render(<HomePage user={user} onSignOut={async()=>{}}/>);fireEvent.click(await screen.findByRole('button',{name:'Retomar treino'}))
  const resumed=screen.getByRole('heading',{name:'Puxada frontal'}).closest('section')!
  expect((within(resumed).getAllByLabelText('kg')[0] as HTMLInputElement).value).toBe('30')
  expect((within(resumed).getAllByLabelText('RPE')[0] as HTMLInputElement).value).toBe('')
  fireEvent.click(screen.getByRole('button',{name:'Revisar e finalizar'}));fireEvent.click(screen.getByRole('button',{name:'Concluir treino parcial'}))
  await waitFor(async()=>{const r=await allRecords(user.id);expect(r[0].payload.status).toBe('completed');expect(r[0].payload.eligible).toBe(false)})
 })
})

it('só ativa a nova ficha após revisão e mantém snapshots anteriores',async()=>{
 const user={id:crypto.randomUUID(),email:'review@example.invalid'} as any
 const {putRecord}=await import('./store')
 const {plans,emptySymptoms}=await import('./model')
 for(let n=0;n<12;n++){const id=crypto.randomUUID();await putRecord(user.id,id,'session',{id,plan:plans('adaptation')[0],phase:'adaptation',start:'2026-09-01T12:00:00Z',end:'2026-09-01T13:00:00Z',status:'completed',eligible:true,logs:{},deferred:[],pre:emptySymptoms(),post:emptySymptoms(),rpeTarget:'5–6'})}
 render(<HomePage user={user} onSignOut={async()=>{}}/>);
 const button=await screen.findByRole('button',{name:'Ativar ficha de consolidação'});expect((button as HTMLButtonElement).disabled).toBe(true)
 for(const name of ['Recuperação suficiente entre sessões?','Lombar estável, sem piora relevante?','Técnica e amplitude consistentes?','Sem novos sintomas neurológicos?'])fireEvent.change(screen.getByLabelText(name),{target:{value:'yes'}})
 fireEvent.click(button)
 await waitFor(async()=>{const records=await allRecords(user.id);expect(records.find(r=>r.kind==='settings')?.payload.phase).toBe('consolidation');expect(records.filter(r=>r.kind==='session').every(r=>r.payload.plan.version==='readaptacao_3dias_v1')).toBe(true)})
})
