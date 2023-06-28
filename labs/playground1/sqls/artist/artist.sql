select 
*
from "artists"
where 
BeginDate = {{ context.params.begin_date }}
