{% cache employee %}
select * from cache_employees where "id" = {{ context.params.id }};
{% endcache %}

select * from departments where "employee_id" = {{ employee.value()[0].id }};
