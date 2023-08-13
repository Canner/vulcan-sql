{% set begin_date = context.params.begin_date %}

select 
*
from "artists"
{% if begin_date %}
    where BeginDate = {{ begin_date }}
{% endif %}