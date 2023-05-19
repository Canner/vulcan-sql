import React from 'react';
import styles from './styles.module.css';
import CodeBlock from '@theme/CodeBlock';
import Link from '@docusaurus/Link';
import FeatureCard, { FeatureData } from './FeatureCards';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

const dynamicParametersCode = `SELECT * FROM public.users
WHERE age >= {{ context.params.age }} AND {{ context.params.age }} <= 19;`;

const validationCode = `urlPath: /orders/order_id
request:
  - fieldName: orders_id
    fieldIn: path
    validators:
      - required
      - uuid`;

const errorResponseCode = `{% req user %}
SELECT COUNT(*) AS count FROM customers WHERE name = {{ context.params.name }}
{% endreq %}

{% if user.value()[0].count == 0 %}
  {% error "CUSTOMER_NOT_FOUND" %}
{% endif %}

SELECT * FROM customers
WHERE name = {{ context.params.name }}
LIMIT 1`;

const AccessControlCode = `SELECT
--- masking address if query user is not admin
{% if context.user.attr.role == 'ADMIN' %}
  address
{% elif %}
  {{ masking('address') }}
{% endif %},

orderId,
amount
FROM orders

--- limit the data to the store user belongs to.
WHERE store = {{ context.user.attr.store }}`;

const ResponseFormatCode = `response-format:
enabled: true
options:
  default: json
  formats:
    - json
    - csv`;

const FeatureList: FeatureData[] = [
  {
    title: 'Parameterized Your SQL',
    schematic: <img src={'./img/build-api-with-sql.png'} />,
    description: (
      <span className={styles.cardDescription}>
        Build APIs with parameterized SQL for seamless extendability.
        Discover more about <Link to="docs/get-started/first-api">API creation</Link>.
      </span>
    ),
  },
  {
    title: 'Comprehensive API Methods',
    schematic: (
      <div className={styles.bestPracticesCodeContainer}>
        <Tabs
          defaultValue="dynamicParameters"
          values={[
            { label: 'Dynamic parameters', value: 'dynamicParameters' },
            { label: 'Validation', value: 'validation' },
            { label: 'Error response', value: 'errorResponse' },
            { label: 'Response format', value: 'responseFormat' },
          ]}
        >
          <TabItem value="dynamicParameters">
            <CodeBlock language="sql">{dynamicParametersCode}</CodeBlock>
          </TabItem>
          <TabItem value="validation">
            <CodeBlock language="yaml">{validationCode}</CodeBlock>
          </TabItem>
          <TabItem value="errorResponse">
            <CodeBlock language="sql">{errorResponseCode}</CodeBlock>
          </TabItem>
          <TabItem value="responseFormat">
            <CodeBlock language="yaml">{ResponseFormatCode}</CodeBlock>
          </TabItem>
        </Tabs>
      </div>
    ),
    description: (
      <span className={styles.cardDescription}>
        Our built-in methods include{' '}
        <Link to="docs/develop/dynamic-param">
          Dynamic Parameters
        </Link>
        , <Link to="docs/develop/validator">API Validation</Link>,{' '}
        <Link to="docs/develop/error">Error Handling</Link>,{' '}
        <Link to="docs/api-plugin/format">Various Response Formats</Link>,
        etc.
      </span>
    ),
  },
  {
    title: 'Access Control in SQL',
    schematic: <CodeBlock language="sql">{AccessControlCode}</CodeBlock>,
    description: (
      <span className={styles.cardDescription}>
        SQL knows who you are and what you can retrieve. Learn about{' '}
        <Link to="docs/data-privacy/overview">Data Privacy</Link>.
      </span>
    ),
  },
  {
    title: 'Automated API Docs & Catalog',
    schematic: <img src={'./img/catalog-api-list.png'} />,
    description: (
      <span className={styles.cardDescription}>
        Generate complete API documentation (OpenAPI) and catalogs automatically, providing a valuable resource for data consumers and web engineers alike. Learn about{' '}
        <Link to="docs/develop/api-doc">API documentation</Link>.
      </span>
    ),
  },
  {
    title: 'Connect from Business Applications',
    schematic: <img src={'./img/catalog-connect-page.png'} />,
    description: (
      <span className={styles.cardDescription}>
        Preview data through our user-friendly interface, which allows you to easily read from your own business applications or export data into files.
      </span>
    ),
  },
];

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.section}>
      <h1 className={`text--center ${styles.title}`}>What is VulcanSQL?</h1>
      <h3 className={`text--center ${styles.cardDescription}`} style={{maxWidth: '900px', marginBottom: '100px'}}>VulcanSQL is an Analytics API framework that helps data analysts to build scalable analytics APIs using only SQL without writing any backend experience.</h3>
      <FeatureCard featureList={FeatureList} />
    </section>
  );
}
