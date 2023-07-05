{% set country_codes = context.params.country_code %}

{% if country_codes %}
    SELECT * FROM read_csv_auto('WHO-COVID-19-global-data.csv')
    WHERE 
        Date_reported >= {{ context.params.start_date | is_required }} AND 
        Date_reported <= {{ context.params.end_date | is_required }} AND
        Country_code IN (SELECT UNNEST(string_split({{ country_codes }}, ',')))
{% else %}
    SELECT * FROM read_csv_auto('WHO-COVID-19-global-data.csv')
    WHERE
        Date_reported >= {{ context.params.start_date | is_required }} AND 
        Date_reported <= {{ context.params.end_date | is_required }}
{% endif %}
