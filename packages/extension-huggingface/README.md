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

VulcanSQL support using Hugging Face tasks by [VulcanSQL Filters](https://vulcansql.com/docs/develop/advanced#filters) statement.

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
    "repository": "hello-world",
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

### Table Question Answering Arguments

Please check [Table Question Answering](https://huggingface.co/docs/api-inference/detailed_parameters#table-question-answering-task) for further information.

| Name           | Required | Default                         | Description                                                                                                                                                |
|----------------|----------|---------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------|
| query          | Y        |                                 | The query in plain text that you want to ask the table.                                                                                                    |
| endpoint       | N        |                                 | The inference endpoint URL, when using `endpoint`, it replaces the original default value of `model`.                                                      |
| model          | N        | google/tapas-base-finetuned-wtq | The model id of a pre-trained model hosted inside a model repo on huggingface.co. See: https://huggingface.co/models?pipeline_tag=table-question-answering |
| use_cache      | N        | true                            | There is a cache layer on the inference API to speedup requests we have already seen                                                                       |
| wait_for_model | N        | false                           | If the model is not ready, wait for it instead of receiving 503. It limits the number of requests required to get your inference done                      |


### Text Generation

The [Text Generation](https://huggingface.co/docs/api-inference/detailed_parameters#text-generation-task) is one of the Natural Language Processing tasks supported by Hugging Face.

Using the `huggingface_text_generation` filter. The result will be a string from `huggingface_text_generation`.

**📢 Notice**: The **Text Generation** default model is **gpt2**, If you would like to use the [Meta LLama2](https://huggingface.co/meta-llama) models, you have two methods to do:

1. Subscribe to the [Pro Account](https://huggingface.co/pricing#pro). 
 - Set the Meta LLama2 model using the `model` keyword argument in `huggingface_text_generation`, e.g: `meta-llama/Llama-2-13b-chat-hf`.

2. Using [Inference Endpoint](https://huggingface.co/inference-endpoints). 
 - Select one of the [Meta LLama2](https://huggingface.co/meta-llama) Models and deploy it to the [Inference Endpoint](https://huggingface.co/inference-endpoints). 
 - Set the endpoint URL using the `endpoint` keyword argument in `huggingface_text_generation`.

**Sample 1 - Subscribe to the [Pro Account](https://huggingface.co/pricing#pro)**:

```sql
{% set data = [
  {
    "rank": 1,
    "institution": "Massachusetts Institute of Technology (MIT)",
    "location code":"US",
    "location":"United States"
  },
  {
    "rank": 2,
    "institution": "University of Cambridge",
    "location code":"UK",
    "location":"United Kingdom"
  },
  {
    "rank": 3,
    "institution": "Stanford University"
    "location code":"US",
    "location":"United States"
  }
  -- other universities.....
] %}

SELECT {{ data | huggingface_text_generation(query="Which university is the top-ranked university?", model="meta-llama/Llama-2-13b-chat-hf") }} as result
```

**Sample 1 - Response**:

```json
[
  {
    "result": "Answer: Based on the provided list, the top-ranked university is Massachusetts Institute of Technology (MIT) with a rank of 1."
  }
]
```

**Sample 2 - Using [Inference Endpoint](https://huggingface.co/inference-endpoints)**:


```sql
{% req universities %}
 SELECT rank,institution,"location code", "location" FROM read_csv_auto('2023-QS-World-University-Rankings.csv') 
{% endreq %}

SELECT {{ universities.value() | huggingface_text_generation(query="Which university located in the UK is ranked at the top of the list?", endpoint='xxx.yyy.zzz.huggingface.cloud') }} as result
```

**Sample 2 - Response**:

```json
[
  {
    "result": "Answer: Based on the list provided, the top-ranked university in the UK is the University of Cambridge, which is ranked at number 2."
  }
]
```

### Text Generation Arguments

Some default value was changed, so it may different from [Text Generation](https://huggingface.co/docs/api-inference/detailed_parameters#text-generation-task) default value.

| Name                 | Required | Default | Description                                                                                                                                                                                                                                                |
|----------------------|----------|---------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| query                | Y        |         | The query in plain text that you want to ask the table.                                                                                                                                                                                                    |
| endpoint             | N        |         | The inference endpoint URL, when using `endpoint`, it replaces the original default value of `model`.                                                                                                                                                      |
| model                | N        | gpt2    | The model id of a pre-trained model hosted inside a model repo on huggingface.co. See: https://huggingface.co/models?pipeline_tag=text-generation                                                                                                          |
| top_k                | N        |         | Integer value to define the top tokens considered within the sample operation to create new text.                                                                                                                                                          |
| top_p                | N        |         | Float value to define the tokens that are within the sample operation of text generation. Add tokens in the sample for more probable to least probable until the sum of the probabilities is greater than top_p.                                           |
| temperature          | N        | 0.1     | Range: (0.0 - 100.0). The temperature of the sampling operation. 1 means regular sampling, 0 means always take the highest score, 100.0 is getting closer to uniform probability.                                                                          |
| repetition_penalty   | N        |         | Range: (0.0 - 100.0). The more a token is used within generation the more it is penalized to not be picked in successive generation passes.                                                                                                                |
| max_new_tokens       | N        | 250     | The amount of new tokens to be generated, this does not include the input length it is a estimate of the size of generated text you want. Each new tokens slows down the request, so look for balance between response times and length of text generated. |
| max_time             | N        |         | Range (0-120.0). The amount of time in seconds that the query should take maximum. Network can cause some overhead so it will be a soft limit. Use that in combination with max_new_tokens for best results.                                               |
| return_full_text     | N        | false   | If set to False, the return results will not contain the original query making it easier for prompting.                                                                                                                                                    |
| num_return_sequences | N        | 1       | The number of proposition you want to be returned.                                                                                                                                                                                                         |
| do_sample            | N        |         | Whether or not to use sampling, use greedy decoding otherwise.                                                                                                                                                                                             |
| use_cache            | N        | true    | There is a cache layer on the inference API to speedup requests we have already seen                                                                                                                                                                       |
| wait_for_model       | N        | false   | If the model is not ready, wait for it instead of receiving 503. It limits the number of requests required to get your inference done                                                                                                                      |
