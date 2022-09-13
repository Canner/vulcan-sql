{% req artist %}
  select count(*) as count from "artists" where ConstituentID = {{ context.params.id }}
{% endreq %}

{% if artist.value()[0].count == 0 %}
  {% error "Artist not found" %}
{% endif %}

select 
*
from "artworks"
where 
concat(', ' , ConstituentID , ',') like concat('%, ', {{ context.params.id }} , ',%');
