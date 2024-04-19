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
  <a aria-label="Follow us" href="https://twitter.com/vulcansql">
    <img alt="" src="https://img.shields.io/badge/-@vulcansql-orange?style=for-the-badge&logo=twitter&logoColor=white&labelColor=gray&logoWidth=20">
  </a>
  <a href="https://img.shields.io/codecov/c/gh/Canner/vulcan-sql" > 
    <img alt="" src="https://img.shields.io/codecov/c/gh/Canner/vulcan-sql?style=for-the-badge&color=orange&labelColor=gray&logoColor=white&logoWidth=20"/> 
  </a>
</p>

## What is VulcanSQL?

**[VulcanSQL](https://vulcansql.com/) is an Analytical Data API Framework for AI agents and data apps**. It aims to help data professionals deliver RESTful APIs from databases, data warehouses or data lakes much easier and secure. It turns your SQL into APIs in no time!

![overview of VulcanSQL](https://i.imgur.com/JvCIZQ1.png)

## Why VulcanSQL?

Given the vast amount of analytical data in databases, data warehouses, and data lakes, there is currently no easy method for data professionals to share data with relevant stakeholders for operational business use cases.

Without a specialized framework to streamline the creation of APIs for AI agents and apps to interact with databases and data warehouses, developers today must undertake a more manual and complex process. This approach comes with several pain points and challenges:

### Traditional Approach and Pain Points

#### 1. Custom API Development:

  - **Time-Consuming**: Developers need to manually code the APIs, which can be time-consuming, especially for complex applications or when dealing with multiple data sources.
  - **Error-Prone**: Manual coding increases the risk of bugs and errors, which can affect the reliability and performance of the APIs.

#### 2. Integration Complexity:
  - **Diverse Data Sources**: Integrating multiple data sources with different formats and protocols requires significant effort and expertise.
  - **Lack of Standardization**: Without a standardized approach, each API might follow different conventions, making it harder for AI agents to interact with them consistently.

#### 3. Security and Compliance:
  - **Security Risks**: Ensuring that APIs are secure and that data access complies with regulations (e.g., GDPR, HIPAA) requires additional layers of work, including authentication, authorization, and data encryption.
  - **Maintenance Overhead**: Security and compliance requirements can evolve, necessitating ongoing maintenance and updates to the APIs.

#### 4. Scalability and Performance:
  - **Scalability Concerns**: Custom-built APIs may not be optimized for scalability, leading to performance issues as the number of requests or the volume of data grows.
  - **Resource Intensive**: Optimizing for performance and scalability can require significant resources, both in terms of development time and infrastructure.

#### 5. Documentation and Usability:
  - **Lack of Documentation**: Properly documenting APIs for easy understanding and use by other developers or AI agents can be overlooked or undervalued.
  - **Usability Issues**: Without clear and comprehensive documentation, it becomes challenging for others to integrate with and effectively use the APIs.

### With **VulcanSQL** you can

- **Rapid Development and Integration**: By abstracting the complexities of directly interacting with databases and data warehouses, developers can focus on the higher-level logic of their applications. This reduces the development time and simplifies the process of integrating AI capabilities into applications.

- **Standardization**: Utilizing OpenAPI documents for interaction provides a standardized way for AI agents to understand and interact with different APIs. This promotes interoperability among various systems and tools, making it easier to integrate with a wide array of services and data sources.

- **Scalability and Maintenance**: A template-driven approach to API creation can make it easier to scale and maintain APIs over time. Changes in the underlying data schema or business logic can be propagated to the APIs more efficiently, without the need for extensive manual adjustments.

- **Accessibility**: Making data more accessible to AI agents through well-defined APIs can unlock new insights and capabilities by leveraging machine learning and analytics. This can enhance decision-making processes and automate routine tasks, among other benefits.

## Online Playground

Use [Online Playground](https://codesandbox.io/p/sandbox/vulcansql-demo-wfd834) to get a taste of VulcanSQL!

## Installation

Please visit [the installation guide](https://vulcansql.com/docs/get-started/installation).

## Examples

Need inspiration? Here are a [selected compilation of examples](https://github.com/Canner/vulcan-sql-examples) showcasing how you can use VulcanSQL!

## How VulcanSQL works?

 💻 **Build**

VulcanSQL offers a development experience similar to dbt. Just insert variables into your templated SQL. VulcanSQL accepts input from your API and generates SQL statements on the fly.

🚀 **Accelerate**

VulcanSQL uses DuckDB as a caching layer, boosting your query speed and reducing API response time. This means faster, smoother data APIs for you and less strain on your data sources.

🔥 **Deploy**

VulcanSQL offers flexible deployment options - whether you prefer Docker or command-based setups. Our `package` command assists in bundling your assets, ensuring a smooth transition from development to deployment of your data APIs.

❤️ **Share**

VulcanSQL offers many data sharing options, seamlessly integrating your data into familiar applications within your workflow and build AI agents.

## Documentation

Below are some common scenarios that you may be interested:

- [Getting Started](https://vulcansql.com/docs/get-started/first-api)
- [Introduction](https://vulcansql.com/docs/intro)
- [Guides to Build Data APIs](https://vulcansql.com/docs/develop/init)
  - [Connecting to Data Sources](https://vulcansql.com/docs/connectors/overview)
  - [Writing SQL Templates](https://vulcansql.com/docs/develop/overview)
  - [Caching Datasets](https://vulcansql.com/docs/develop/cache)
  - [Error Handling](https://vulcansql.com/docs/develop/error)
  - [API Parameters Validation](https://vulcansql.com/docs/develop/validator)
  - [Data Privacy](https://vulcansql.com/docs/data-privacy/overview)
- [Extensions](https://vulcansql.com/docs/extensions/overview)
- [API Configurations](https://vulcansql.com/docs/api-plugin/overview)
- [Deployment](https://vulcansql.com/docs/deployment)

## Use Cases

🤖 **AI agents**: Streamline the creation of APIs for AI agents to interact with databases and data warehouses.

📈 **Customer-facing analytics**: Expose analytics in your SaaS product for customers to understand how the product is performing for them via customer dashboards, insights, and reports.

👏 **Data sharing**: Sharing data with partners, vendors, or customers, which requires a secure and scalable way to expose data.

⚙️ **Internal tools**: Integration with internal tools like Zapier, AppSmith and Retools, etc.

## Community

- If there is any issues, please visit [Github Issues](https://github.com/Canner/vulcan-sql/issues).
