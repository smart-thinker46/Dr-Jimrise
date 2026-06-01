create or replace function public.student_can_view_assignment(target_assignment_id uuid, target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.assignment_tasks a
    where a.id = target_assignment_id
      and (
        a.target_scope = 'all'
        or exists (
          select 1
          from public.assignment_task_users atu
          where atu.assignment_id = a.id
            and atu.user_id = target_user_id
        )
        or exists (
          select 1
          from public.student_profiles sp
          join public.assignment_task_groups atg on atg.group_id = sp.group_id
          where sp.user_id = target_user_id
            and atg.assignment_id = a.id
        )
      )
  );
$$;

grant execute on function public.student_can_view_assignment(uuid, uuid) to authenticated;

drop policy if exists "students read visible assignment tasks" on public.assignment_tasks;
create policy "students read visible assignment tasks"
on public.assignment_tasks
for select
to authenticated
using (
  public.has_role(auth.uid(), 'admin')
  or public.student_can_view_assignment(id, auth.uid())
);

drop policy if exists "students read visible assignment task groups" on public.assignment_task_groups;
drop policy if exists "students read own assignment task users" on public.assignment_task_users;

drop policy if exists "students submit own assignments" on public.assignment_submissions;
create policy "students submit own assignments"
on public.assignment_submissions
for insert
to authenticated
with check (
  student_id = auth.uid()
  and public.student_can_view_assignment(assignment_id, auth.uid())
);

drop policy if exists "students resubmit own rejected assignments" on public.assignment_submissions;
create policy "students resubmit own rejected assignments"
on public.assignment_submissions
for update
to authenticated
using (
  student_id = auth.uid()
  and status = 'rejected'
  and public.student_can_view_assignment(assignment_id, auth.uid())
)
with check (
  student_id = auth.uid()
  and status = 'submitted'
  and public.student_can_view_assignment(assignment_id, auth.uid())
);

notify pgrst, 'reload schema';
