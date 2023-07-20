# extension-huggingface

Supporting Hugging Face Inference API task for VulcanSQL, provided by [Canner](https://canner.io/).

## Installation

1. Install the package:

   ```bash
   npm i @vulcan-sql/extension-huggingface
   ```

2. Update your `vulcan.yaml` file to enable the extension:

   ```yaml
   extensions:
     hf: '@vulcan-sql/extension-huggingface'

   hf:
     # Required: Hugging Face access token, see: https://huggingface.co/docs/hub/security-tokens
     accessToken: 'your-huggingface-access-token'
   ```

## Using Hugging Face

VulcanSQL support using Hugging Face tasks by [VulcanSQL Filters](https://vulcansql.com/docs/develop/advance#filters) statement.

### Table Question Answering

The [Table Question Answering](https://huggingface.co/docs/api-inference/detailed_parameters#table-question-answering-task) is one of the Natural Language Processing tasks supported by Hugging Face.

Using the `huggingface_table_question_answering` filter.

Sample 1:

```sql
{% set data = [
  {
    "repository": "vulcan-sql",
    "topic": ["analytics", "data-lake", "data-warehouse", "api-builder"],
    "description":"Create and share Data APIs fast! Data API framework for DuckDB, ClickHouse, Snowflake, BigQuery, PostgreSQL",
  },
  {
    "repository": "accio",
    "topic": ["data-analytics", "data-lake", "data-warehouse", "bussiness-intelligence"],
    "description": "Query Your Data Warehouse Like Exploring One Big View.",
  },
  {
    "repository": "hell-word",
    "topic": [],
    "description": "Sample repository for testing",
  },
] %}

-- The source data from "huggingface_table_question_answering" need array of object type.
SELECT {{ data | huggingface_table_question_answering(query="How many repositories related to data-lake topic?") }}
```

Sample 2:

```sql
{% req products %}
  SELECT * FROM products
{% endreq %}

-- The "model" argument is optional, if not provide it, default is 'google/tapas-base-finetuned-wtq'
SELECT {{ orders.value() | huggingface_table_question_answering(query="How many products related to 3C type?", model="microsoft/tapex-base-finetuned-wtq") }}
```
