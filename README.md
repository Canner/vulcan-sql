<p align="center">
  <img src="https://i.imgur.com/9xLnLed.png" width="600" >
</p>

<p align="center">
  <a aria-label="Canner" href="https://cannerdata.com/">
    <img src="https://img.shields.io/badge/%F0%9F%A7%A1-Made%20by%20Canner-orange?style=for-the-badge">
  </a>
  <a aria-label="NPM version" href="https://www.npmjs.com/package/@vulcan-sql/core">
    <img alt="" src="https://img.shields.io/npm/v/@vulcan-sql/core?color=orange&style=for-the-badge">
  </a>
  <a aria-label="License" href="https://github.com/Canner/vulcan-sql/blob/develop/LICENSE">
    <img alt="" src="https://img.shields.io/github/license/canner/vulcan-sql?color=orange&style=for-the-badge">
  </a>
  <a aria-label="Join the community on GitHub" href="https://discord.gg/ztDz8DCmG4">
    <img alt="" src="https://img.shields.io/badge/-JOIN%20THE%20COMMUNITY-orange?style=for-the-badge&logo=discord&logoColor=white&labelColor=grey&logoWidth=20">
  </a>
  <a aria-label="Follow us" href="https://twitter.com/vulcansql">
    <img alt="" src="https://img.shields.io/twitter/follow/vulcansql?color=orange&style=for-the-badge">
  </a>
</p>

## What is VulcanSQL

> **VulcanSQL is an Data API Framework** that helps analytics engineers build scalable data APIs using only SQL templates without any backend skills required.

![overview of VulcanSQL](https://i.imgur.com/JvCIZQ1.png)

## Why VulcanSQL?

APIs are still the primary programming interface for data consumers to utilize data in their daily business applications, such as web applications, automation services, spreadsheets and internal tools. However, data stored in data warehouses are not accessible for those users and tools without an API consumption layer.

VulcanSQL aims to solve that problem by translating SQL into flexible APIs; it is contextual in that it can translate APIs into the corresponding SQL based on different user personas and business contexts. It is also extendable with custom business logic and complex SQL translation.

## When use VulcanSQL?

When scaling data usages outside the traditional data team to business users and application developers using APIs. VulcanSQL is the perfect solution for data using in applications.

## Features

- Parameterized SQL into scalable and secure APIs
- Built-in API access control
- Built-in self-generated API documentation
- Integrate with existing toolsets, such as Excel / Google spreadsheet, Zapier, Retool, etc.

## Data sources support

- PosgreSQL
- DuckDB
- Snowflake
- BigQuery

## How VulcanSQL works?

### Step 1: Parameterized your SQL.

<p align="center">
  <img src="https://i.imgur.com/2PMrlJC.png" width="600" >
</p>

Build APIs with just parameterized your SQL and with extendability.

**Example: passing parameters from URL**

```sql
select * from public.users where id = {{ context.params.userId }}
```

You can build an API endpoint `/users` with `userId` as input easily, You can immediately get data through API as below.

```js
GET /users?userId=1

Response
[{
  "name": "wwwy3y3",
  "age": 30
}]
```

#### **Other Examples:**

<details>
  <summary>1. Error Handling</summary>

If you want to throw errors based on business logic. for example, run a query first, if no data return, throw `404 not found`.

```sql
{% req user %}
select * from public.users where userName = {{ context.parames.userName }} limit 1;
{% endreq %}

{% if user.value().length == 0 %}
  {% error "user not found" %}
{% endif %}

select * from public.groups where userId = {{ user.value()[0].id }};
```

</details>

<details>
  <summary>2. Authorization</summary>

You can pass in user attributes to achieve user access control. We will build the corresponding SQL on the fly.

```sql
select
  --- masking address if query user is not admin
  {% if context.user.name == 'ADMIN' %}
    {% "address" %}
  {% elif %}
    {% "masking(address)" %}
  {% endif %},

  orderId,
  amount
from orders

--- limit the data to the store user belongs to.
where store = {{ context.user.attr.store }}
```

</details>

<details>
  <summary>3. Validation</summary>

You can add a number validator on `userId` input.

- SQL
  ```sql
  select * from public.users where id = {{ context.params.userId }}
  ```
- Schema
`yaml parameters: userId: in: query validators: # set your validator here. - name: 'number' `
</details>

### Step 2: Build self-service documentation and catalog

VulcanSQL will automatically build documentation and catalog for you.

- **API Catalog**: VulcanSQL will build an API catalog page for data consumers to learn how to use the APIs and explore data in the dashboard.

<p align="center">
  <img src="https://i.imgur.com/qz6swW2.png" width="800" >
</p>

<p align="center">
  <img src="https://i.imgur.com/YZFczO3.png" width="800" >
</p>

- **API Documentation**: VulcanSQL will build a Swagger API page for backend engineers.

<p align="center">
  <img src="https://i.imgur.com/oH9UEoD.png" width="800" >
</p>

### Step 3: Connect from framework & applications

On API catalog page, you can preview data or read from your applications.

- You can `Copy API URL` and use it in your frontend/backend applications.
- You can download the selected data as CSV or JSON.

<p align="center">
  <img src="https://i.imgur.com/YZFczO3.png" width="800" >
</p>

- You can follow the steps to read from Excel/Google Spreadsheet/Zapier/Retools.

<p align="center">
  <img src="https://i.imgur.com/zOEdRYT.png" width="800" >
</p>

## Installation

Visit [the documentation](https://vulcansql.com/docs/get-started/installation) for installation guide.

## Demo Screenshot

<p align="center">
  <img src="https://i.imgur.com/j4jcYj1.png" width="800" >
</p>

> 🔑 **Login Page**: Users will need to login.

<p align="center">
  <img src="https://i.imgur.com/0VmXMpl.png" width="800" >
</p>

> 📖 **Catalog**: After logged-in, users can see what endpoints are available to be used.

<p align="center">
  <img src="https://i.imgur.com/YZFczO3.png" width="800" >
</p>

> ✅ **Endpoint**: Users can view the details of one endpoint and preview the data.

<p align="center">
  <img src="https://i.imgur.com/zOEdRYT.png" width="800" >
</p>

> 🔌 **Connect**: Users will be able to follow the guide and connect from their applications.

## Community

- Welcome to our [Discord](https://discord.gg/ztDz8DCmG4) to give us feedback!
- If any issues, please visit [Github Issues](https://github.com/Canner/vulcan-sql/issues)
