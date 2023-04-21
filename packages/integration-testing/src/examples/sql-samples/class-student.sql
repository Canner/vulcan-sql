{% cache %}
select id, name from cache_students 
where exists (
  select * from cache_classes
  where cache_classes.id = {{ context.params.id }} and cache_classes.id = cache_students.class_id
);
{% endcache %}