import { describe, it, expect } from 'vitest'
import { countAdaptationSessions, adaptationStage, canTransition } from './adaptation'
describe('adaptação por sessões realizadas',()=>{
 it('exclui extras, sessões parciais, canceladas, apagadas e duplicadas',()=>{
  const base={id:'one',status:'completed',is_optional:false,counts_for_adaptation:true}
  expect(countAdaptationSessions([base,base,{...base,id:'extra',is_optional:true},{...base,id:'partial',counts_for_adaptation:false},{...base,id:'cancelled',status:'cancelled'},{...base,id:'deleted',deleted_at:'2026-09-01'}])).toBe(1)
 })
 it('avança o bloco a cada três sessões, sem depender de datas',()=>{
  expect([0,2,3,6,9,12,30].map(adaptationStage)).toEqual([1,1,2,3,4,4,4])
 })
 it('não autoriza transição só por atingir a quantidade',()=>{
  expect(canTransition(11,true,true,true,false)).toBe(false)
  expect(canTransition(12,true,true,true,false)).toBe(true)
  expect(canTransition(12,false,true,true,false)).toBe(false)
  expect(canTransition(12,true,false,true,false)).toBe(false)
  expect(canTransition(12,true,true,false,false)).toBe(false)
  expect(canTransition(12,true,true,true,true)).toBe(false)
 })
})
