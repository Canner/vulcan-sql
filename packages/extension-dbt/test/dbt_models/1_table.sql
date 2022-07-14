{{ config(materialized='table') }}

with source_data as (
    select 1 as id, 'Ivan' as name, 18 as age
	UNION
    select 2 as id, 'William' as name, 80 as age
    UNION
    select 3 as id, 'Eason' as name, 18 as age
)

select * from source_data
