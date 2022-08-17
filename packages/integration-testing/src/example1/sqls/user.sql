select * from public.users
where id = '{{ context.params.id }}';