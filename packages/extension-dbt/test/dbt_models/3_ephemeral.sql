{{ config(materialized='ephemeral') }}

select *
from {{ ref('1_table') }}
where age <= 18