-- Demo login accounts for the dashboard.
-- Password for both accounts: 123Demo...

create extension if not exists pgcrypto with schema extensions;

do $$
declare
  demo_instance_id uuid := '00000000-0000-0000-0000-000000000000';
  admin_id uuid := '11111111-1111-4111-8111-111111111111';
  student_id uuid := '22222222-2222-4222-8222-222222222222';
  demo_password text := '123Demo...';
begin
  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  values
    (
      demo_instance_id,
      admin_id,
      'authenticated',
      'authenticated',
      'admin@ochwach.ac.ke',
      extensions.crypt(demo_password, extensions.gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"name":"Demo Admin"}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      ''
    ),
    (
      demo_instance_id,
      student_id,
      'authenticated',
      'authenticated',
      'student@ochwach.ac.ke',
      extensions.crypt(demo_password, extensions.gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"name":"Demo Student"}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      ''
    )
  on conflict (id) do update
  set
    email = excluded.email,
    encrypted_password = excluded.encrypted_password,
    email_confirmed_at = excluded.email_confirmed_at,
    raw_app_meta_data = excluded.raw_app_meta_data,
    raw_user_meta_data = excluded.raw_user_meta_data,
    updated_at = now();

  insert into auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  )
  values
    (
      admin_id,
      admin_id,
      'admin@ochwach.ac.ke',
      jsonb_build_object(
        'sub', admin_id::text,
        'email', 'admin@ochwach.ac.ke',
        'email_verified', true
      ),
      'email',
      now(),
      now(),
      now()
    ),
    (
      student_id,
      student_id,
      'student@ochwach.ac.ke',
      jsonb_build_object(
        'sub', student_id::text,
        'email', 'student@ochwach.ac.ke',
        'email_verified', true
      ),
      'email',
      now(),
      now(),
      now()
    )
  on conflict (provider_id, provider) do update
  set
    user_id = excluded.user_id,
    identity_data = excluded.identity_data,
    updated_at = now();

  insert into public.user_roles (user_id, role)
  values
    (admin_id, 'admin'),
    (student_id, 'student')
  on conflict (user_id, role) do nothing;

  delete from public.user_roles
  where user_id = admin_id
    and role = 'student';
end $$;
