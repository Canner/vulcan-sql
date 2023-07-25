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

**⚠️ Caution**: Hugging Face has a [rate limit](https://huggingface.co/docs/api-inference/faq#rate-limits), so it does not allow sending large datasets to the Hugging Face library for processing. Otherwise, using a different Hugging Face model may yield different results or even result in failure.

### Table Question Answering

The [Table Question Answering](https://huggingface.co/docs/api-inference/detailed_parameters#table-question-answering-task) is one of the Natural Language Processing tasks supported by Hugging Face.

Using the `huggingface_table_question_answering` filter.

The result will be converted to a JSON string from `huggingface_table_question_answering`. You could decompress the JSON string and use the result by itself.

**Sample 1 - send the data from variable by [set tag](https://vulcansql.com/docs/develop/advance#set-variables):**

```sql
{% set data = [
  {
    "repository": "vulcan-sql",
    "topic": ["analytics", "data-lake", "data-warehouse", "api-builder"],
    "description":"Create and share Data APIs fast! Data API framework for DuckDB, ClickHouse, Snowflake, BigQuery, PostgreSQL"
  },
  {
    "repository": "accio",
    "topic": ["data-analytics", "data-lake", "data-warehouse", "bussiness-intelligence"],
    "description": "Query Your Data Warehouse Like Exploring One Big View."
  },
  {
    "repository": "hell-word",
    "topic": [],
    "description": "Sample repository for testing"
  }
] %}

-- The source data for "huggingface_table_question_answering" needs to be an array of objects.
SELECT {{ data | huggingface_table_question_answering(query="How many repositories related to data-lake topic?") }} as result
```

**Sample 1 - Response:**

```json
[
  {
    "result": "{\"answer\":\"COUNT > vulcan-sql, accio\",\"coordinates\":[[0,0],[1,0]],\"cells\":[\"vulcan-sql\",\"accio\"],\"aggregator\":\"COUNT\"}"
  }
]
```

**Sample 2 - send the data from [req tag](https://vulcansql.com/docs/develop/predefined-queries):**

```sql
{% req artists %}
  SELECT * FROM artists
{% endreq %}

{% set question = "List display name where gender are female?" %}

-- The "model" keyword argument is optional. If not provided, the default value is 'google/tapas-base-finetuned-wtq'.
-- The "wait_for_model" keyword argument is optional. If not provided, the default value is false.
-- The "use_cache" keyword argument is optional. If not provided, the default value is true.
SELECT {{ products.value() | huggingface_table_question_answering(query=question, model="microsoft/tapex-base-finetuned-wtq", wait_for_model=true, use_cache=true) }}
```

**Sample 2 - Response:**

```json
[
  {
    "result": "{\"answer\":\"Irene Aronson, Ruth Asawa, Isidora Aschheim, Geneviève Asse, Dana Atchley, Aino Aalto, Berenice Abbott\",\"coordinates\":[[8,1],[16,1],[17,1],[23,1],[25,1],[29,1],[35,1]],\"cells\":[\"Irene Aronson\",\"Ruth Asawa\",\"Isidora Aschheim\",\"Geneviève Asse\",\"Dana Atchley\",\"Aino Aalto\",\"Berenice Abbott\"],\"aggregator\":\"NONE\"}"
  }
]
```
