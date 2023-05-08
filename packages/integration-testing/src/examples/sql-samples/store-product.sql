{% cache stores %}
select * from cache_stores where "id" = {{ context.params.id }};
{% endcache %}

{% cache %}
select * from cache_products where "store_id" = {{ stores.value()[0].id }};
{% endcache %}
