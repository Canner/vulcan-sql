select 
*
from "artworks"
where 
concat(', ' , ConstituentID , ',') like concat('%, ', {{ context.params.id }} , ',%');
