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
    title: 'Parameterized your SQL',
    schematic: <img src={'./img/build-api-with-sql.png'} />,
    description: (
      <span className={styles.cardDescription}>
        Build APIs with just parameterized your SQL and with extendability.  Learn about{' '}
        <Link to="docs/api-building/configuration">building API</Link>.
      </span>
    ),
  },
  {
    title: 'Comprehensive API methods',
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
        Included{' '}
        <Link to="docs/api-building/sql-syntax#dynamic-parameter">
          dynamic parameters
        </Link>
        , <Link to="docs/api-building/api-validation">validation</Link>,{' '}
        <Link to="docs/api-building/error-response">error response</Link>,{' '}
        <Link to="docs/api-building/response-format">response format</Link>,
        etc.
      </span>
    ),
  },
  {
    title: 'Access control in SQL',
    schematic: <CodeBlock language="sql">{AccessControlCode}</CodeBlock>,
    description: (
      <span className={styles.cardDescription}>
        SQL knows who you are and what you can retrieve. Learn about{' '}
        <Link to="docs/api-building/access-control">access control</Link>.
      </span>
    ),
  },
  {
    title: 'API docs & catalog',
    schematic: <img src={'./img/catalog-api-list.png'} />,
    description: (
      <span className={styles.cardDescription}>
        Automatically build complete API documentation(OpenAPI) and catalog for data
        consumers and web engineer. Learn about{' '}
        <Link to="docs/api-building/api-document">API documentation</Link>.
      </span>
    ),
  },
  {
    title: 'Connect from business applications',
    schematic: <img src={'./img/catalog-connect-page.png'} />,
    description: (
      <span className={styles.cardDescription}>
        Preview data and self-serve interface to read from your own business applications or export into files.
      </span>
    ),
  },
];

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.section}>
      <h1 className={`text--center ${styles.title}`}>What is VulcanSQL?</h1>
      <h3 className={`text--center ${styles.cardDescription}`} style={{maxWidth: '900px', marginBottom: '100px'}}>VulcanSQL is an Analytics API generator that helps data engineers to build scalable analytics APIs using only SQL without writing any backend code.</h3>
      <FeatureCard featureList={FeatureList} />
    </section>
  );
}
