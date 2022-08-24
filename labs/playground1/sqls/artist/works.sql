select 
*
from "artworks"
where 
concat(', ' , ConstituentID , ',') like '%, {{ context.params.id }},%'
