select *
from public.users
where id = "{{ context.params.id }}"
limit 1;