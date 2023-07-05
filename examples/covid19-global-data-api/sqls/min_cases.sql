{% set group_by = context.params.group_by %}

{% if group_by and group_by != "WHO_region" and group_by != "Country_code" %}
    {% error "group_by should be WHO_region or Country_code" %}
{% endif %}

{% if group_by and group_by == "WHO_region" %}
    SELECT WHO_region, SUM(New_cases) as Total_cases
    FROM read_csv_auto('WHO-COVID-19-global-data.csv') 
    WHERE 
        Date_reported >= {{ context.params.start_date | is_required }} AND 
        Date_reported <= {{ context.params.end_date | is_required }}
    GROUP BY WHO_region
    ORDER BY Total_cases ASC
    LIMIT {{ context.params.top_n | is_required }}
{% else %}
    SELECT Country_code, ANY_VALUE(Country), SUM(New_cases) as Total_cases
    FROM read_csv_auto('WHO-COVID-19-global-data.csv') 
    WHERE 
        Date_reported >= {{ context.params.start_date | is_required }} AND 
        Date_reported <= {{ context.params.end_date | is_required }}
    GROUP BY Country_code
    ORDER BY Total_cases ASC
    LIMIT {{ context.params.top_n | is_required }}
{% endif %}