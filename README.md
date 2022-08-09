<p align="center">
  <img src="https://i.imgur.com/GJsuthW.png" width="600" >
</p>

<p align="center">
  <a aria-label="Canner" href="https://cannerdata.com/">
    <img src="https://img.shields.io/badge/%F0%9F%A7%A1-Made%20by%20Canner-orange?style=for-the-badge">
  </a>
  <a aria-label="NPM version" href="https://www.npmjs.com/package/@vulcan-sql/core">
    <img alt="" src="https://img.shields.io/npm/v/@vulcan-sql/core?color=orange&style=for-the-badge">
  </a>
  <a aria-label="License" href="https://github.com/Canner/vulcan/blob/develop/LICENSE">
    <img alt="" src="https://img.shields.io/github/license/canner/vulcan?color=orange&style=for-the-badge">
  </a>
  <a aria-label="Join the community on GitHub" href="https://join.slack.com/t/vulcan-bhi6765/shared_invite/zt-1dzixpy38-pKrcewZ6eM3wSqAs6~is8Q">
    <img alt="" src="https://img.shields.io/badge/-JOIN%20THE%20COMMUNITY-orange?style=for-the-badge&logo=Slack&labelColor=black&logoWidth=20">
  </a>
</p>

> 🚀 Release in Sep 2022.

## Why Vulcan
> ⚡️ Data analyst / analytical engineers’ time should focus on important matters like data transformation and communicating with data consumers on high level.

<p align="center">
  <img src="https://i.imgur.com/OTFP6Qh.jpg" width="800" >
</p>

Data analysts and analytical engineers often take lots of time helping data consumers. Backend engineers who build internal dashboards will ask about data catalog, documentations and if there are any APIs they can directly use. Business users will ask what data they can use to achieve their goals, and how to get data to their spreadsheet or excel.

<p align="center">
  <img src="https://i.imgur.com/dn5kzXC.png" width="800" >
</p>

With Vulcan, we prepare what data consumers need for you. Imagine you can **unify the data access by building APIs instantly with just SQL. Authorization, validation, pagination features work out of the box.**

Vulcan also builds documentations and a self-serve catalog, so **data consumers can understand the data and get data from the tools they’re using all by themselves without using any SQL**.

## Features
- Build API instantly with just SQL.
- Access control & authorization in SQL.
- API best practices included (validation, caching, pagination, sorting, etc).
- API documentation is automatically built.
- Self-serve API catalog for data consumers. A step-by-step guide to get data from Excel / Google spreadsheet, Zapier, Retool, etc.

## How Vulcan works?

### Step 1: Instant API with just SQL.
<p align="center">
  <img src="https://i.imgur.com/2PMrlJC.png" width="600" >
</p>

Building API with just SQL. No complex web framework and business logic.

**Example: passing parameters from url**

```sql
select * from public.users where id = '{{ params.userId }}'
```

You can build an API endpoint `users` with `userId` as input.

API users will be able to get data like

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

  If you want to throw errors based on data, for example, run a query first, if no data return, throw `404 not found`.
  
  ```sql
  {% req user %}
  select * from public.users where userName = '{{ parames.userName }}';
  {% endreq %}
  
  {% if user.count().value() == 0 %}
    {% error "user not found" %}
  {% endif %}
  
  select * from public.groups where userId = '{{ user.value()[0].id }}';
  ```
</details>

<details>
  <summary>2. Authorization</summary>

  You can pass in user attributes to SQL to control the access.
    
  ```sql
  select
    --- masking address if query user is not admin
    {% if context.user == 'ADMIN' %}
      {% "address" %}
    {% elif %}
      {% "masking(address)" %}
    {% endif %},
    
    orderId,
    amount
  from orders

  --- limit the data to the store user belongs to.
  where store = {{ context.user.store }}
  ```
</details>

<details>
  <summary>3. Validation</summary>

  You can add a number validator on `userId` input on your API with schema.

  - SQL
      ```sql
      select * from public.users where id = '{{ params.userId }}'
      ```
      
  - Schema
      ```yaml
      parameters:
        userId:
          in: query
          valudators:
            - name: 'number'
      ```
</details>


### Step 2: Build self-serve documentation and catalog

Vulcan will automatically build documentation and catalog.

- **Catalog**: Vulcan will build a catalog page for data consumers. This page will consist of more clear information on data that is exposed as APIs. Description, Column information are all included.

<p align="center">
  <img src="https://i.imgur.com/qz6swW2.png" width="800" >
</p>

<p align="center">
  <img src="https://i.imgur.com/YZFczO3.png" width="800" >
</p>

- **API Documentation**: Vulcan will build a swagger page for backend engineers.

<p align="center">
  <img src="https://i.imgur.com/oH9UEoD.png" width="800" >
</p>

### Step 3: Connect from framework & applications

On API catalog page, you can preview data here and connect from your own framework and applications.

- You can `Copy API URL` to use it at frontend / backend.
- You can download the selected data as CSV or JSON.

<p align="center">
  <img src="https://i.imgur.com/YZFczO3.png" width="800" >
</p>

- You can follow the steps to connect from Excel / Google Spreadsheet / Zapier / Retools.

<p align="center">
  <img src="https://i.imgur.com/zOEdRYT.png" width="800" >
</p>

## Installation

- npm / yarn
    ```bash
    npm install @vulcan-sql/cli
    yarn add @vulcan-sql/cli
    ```
    
- brew
    ```sql
    brew install vulcan
    ```
    

## Quickstart

1. Initialize a Vulcan project
    ```bash
    vulcan init --name my-first-vulcan-project && cd my-first-vulcan-project
    ```
    
2. Start Vulcan server.
    ```bash
    vulcan start --watch
    ```
    
3. Visit API & Catalog
    ```bash
    Vulcan started...
    Visit API document at http://localhost:8080/doc
    Visit Catalog at http://localhost:8080/catalog
    ```

## Demo Screenshot
<p align="center">
  <img src="https://i.imgur.com/j4jcYj1.png" width="800" >
</p>

> 🔑 **Login Page**: data consumers will be asked to authenticate themselves.

<p align="center">
  <img src="https://i.imgur.com/0VmXMpl.png" width="800" >
</p>

> 📖 **Catalog**: After logged-in, data consumers can see what endpoints are available to be used.

<p align="center">
  <img src="https://i.imgur.com/YZFczO3.png" width="800" >
</p>

> ✅ **Endpoint**: data consumers can view the details of one endpoint and preview the data.

<p align="center">
  <img src="https://i.imgur.com/zOEdRYT.png" width="800" >
</p>

> 🔌 **Connect**: data consumers will be able to follow the guide and connect from their applications.

## Community
* Welcome to our [Slack](https://join.slack.com/t/vulcan-bhi6765/shared_invite/zt-1dzixpy38-pKrcewZ6eM3wSqAs6~is8Q) to give us feedbacks!
* If any issues, please visit [Github Issues](https://github.com/Canner/vulcan/issues)

