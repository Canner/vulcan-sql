# extension-api-caller

Allow to call APIs from other sources for VulcanSQL, provided by [Canner](https://canner.io/).

## Installation

1. Install the package:

   ```bash
   npm i @vulcan-sql/extension-api-caller
   ```

2. Update your `vulcan.yaml` file to enable the extension:

   ```yaml
   extensions:
     api: '@vulcan-sql/extension-api-caller'
   ```

## Usage

To pass the path parameters:

```sql
{% set a_variable_you_can_define = { "path": { "id": 1 } } %}
SELECT {{ (a_variable_you_can_define | rest_api(url='https://dummyjson.com/products/:id')).id }}
```

To pass the query parameters:

```sql
{% set a_variable_you_can_define = { "query": { "q": "phone" }  } %}
SELECT {{ a_variable_you_can_define | rest_api(url='https://dummyjson.com/products/search') | dump }}
```

To issue the POST request:

```sql
{% set a_variable_you_can_define = { "body": { "title": "BMW Pencil" } } %}
SELECT {{ a_variable_you_can_define | rest_api(url='https://dummyjson.com/products/add', method='POST') | dump }}
```

To pass the headers and multiple fields:

```sql
{% set a_variable_you_can_define = { "headers": { "Content-Type": "application/json" }, "body": { "title": "BMW Pencil" } } %}
SELECT {{ a_variable_you_can_define | rest_api(url='https://dummyjson.com/products/add', method='POST') | dump }}
```