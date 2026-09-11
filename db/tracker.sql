-- Atomic records with per-account ownership and optimistic concurrency.
create table public.tracker_records (
 id uuid not null,
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 kind text not null check (kind in ('session','settings','checkin','measurement')),
 payload jsonb not null check (jsonb_typeof(payload) = 'object'),
 revision bigint not null default 1 check (revision > 0),
 mutation_id uuid not null,
 updated_at timestamptz not null default now(),
 primary key (user_id,id),
 check (octet_length(payload::text) <= 524288)
);
create index tracker_records_user_kind on public.tracker_records(user_id,kind);
alter table public.tracker_records enable row level security;
alter table public.tracker_records force row level security;
revoke all on public.tracker_records from anon;
grant select,insert,update on public.tracker_records to authenticated;
create policy tracker_read on public.tracker_records for select to authenticated using ((select auth.uid())=user_id);
create policy tracker_insert on public.tracker_records for insert to authenticated with check ((select auth.uid())=user_id);
create policy tracker_update on public.tracker_records for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);

create function public.save_tracker_record(record_id uuid, record_kind text, record_payload jsonb, expected_revision bigint, request_id uuid)
returns bigint language plpgsql security invoker set search_path = '' as $$
declare current_row public.tracker_records; result_revision bigint;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 -- Serialize both first insert and updates for the same account and record.
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(auth.uid()::text || record_id::text,0));
 select * into current_row from public.tracker_records where user_id=auth.uid() and id=record_id for update;
 if found then
   if current_row.mutation_id=request_id then return current_row.revision; end if;
   if current_row.revision<>expected_revision then raise exception 'REVISION_CONFLICT'; end if;
   if current_row.kind<>record_kind then raise exception 'Record kind cannot change'; end if;
   update public.tracker_records set payload=record_payload,revision=revision+1,mutation_id=request_id,updated_at=now()
    where user_id=auth.uid() and id=record_id returning revision into result_revision;
 else
   if expected_revision<>0 then raise exception 'REVISION_CONFLICT'; end if;
   insert into public.tracker_records(id,user_id,kind,payload,mutation_id) values(record_id,auth.uid(),record_kind,record_payload,request_id) returning revision into result_revision;
 end if;
 return result_revision;
end $$;
revoke all on function public.save_tracker_record(uuid,text,jsonb,bigint,uuid) from public,anon;
grant execute on function public.save_tracker_record(uuid,text,jsonb,bigint,uuid) to authenticated;
