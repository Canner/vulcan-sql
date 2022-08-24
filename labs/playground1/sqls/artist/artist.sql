select 
*
from "artists"
where 
ConstituentID = {{ context.params.id }}
