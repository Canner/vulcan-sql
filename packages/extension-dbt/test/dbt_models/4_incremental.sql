{{ config(materialized='incremental') }}

select *
from {{ ref('3_ephemeral') }}
