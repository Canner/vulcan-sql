select 
*
from "artists"
where
ConstituentID = {{ context.params.id }}
{% if contex.params.begin_date %}
    and BeginDate = {{ context.params.begin_date }}
{% endif %}