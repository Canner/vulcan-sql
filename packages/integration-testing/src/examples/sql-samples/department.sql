{% cache %}
select * from cache_departments
where "name" = {{ context.params.name }};
{% endcache %}
