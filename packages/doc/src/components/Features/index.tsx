import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';
import CodeBlock from '@theme/CodeBlock';
import Link from '@docusaurus/Link';
import FeatureCard, { FratureData } from './FeatureCards';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

const dynamicParemetersCode = `SELECT * FROM public.users
WHERE age >= {{ context.params.age }} AND {{ context.params.age }} <= 19;`;

const validationCode = `SELECT * FROM public.users
WHERE id =  {{ context.params.userID }}`;

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
  {% "address" %}
{% elif %}
  {% "masking(address)" %}
{% endif %},

orderId,
amount
FROM orders

--- limit the data to the store user belongs to.
WHERE store = {{ context.user.store }}`;

const FeatureList: FratureData[] = [
  {
    title: 'Build API instantly with just SQL',
    schematic: <img src={'./img/buildAPIwithSQL.png'} />,
    description: (
      <span className={styles.cardDescription}>
        No complex web framework and business logic. Learn about{' '}
        <Link to="docs/api-building/configuration">building API</Link>.
      </span>
    ),
  },
  {
    title: 'Provide API best practices',
    schematic: (
      <Tabs
        defaultValue="dynamicParemeters"
        values={[
          { label: 'Dynamic paremeters', value: 'dynamicParemeters' },
          { label: 'Validation', value: 'validation' },
          { label: 'Error response', value: 'errorResponse' },
        ]}
      >
        <TabItem value="dynamicParemeters">
          <CodeBlock language="sql">{dynamicParemetersCode}</CodeBlock>
        </TabItem>
        <TabItem value="validation">
          <CodeBlock language="sql">{validationCode}</CodeBlock>
        </TabItem>
        <TabItem value="errorResponse">
          <CodeBlock language="sql">{errorResponseCode}</CodeBlock>
        </TabItem>
      </Tabs>
    ),
    description: (
      <span className={styles.cardDescription}>
        Included{' '}
        <Link to="docs/api-building/sql-template#dynamic-parameter">
          dynamic paremeters
        </Link>
        , <Link to="docs/api-building/api-validation">validation</Link>,{' '}
        <Link to="docs/api-building/error-response">error response</Link>, etc..
      </span>
    ),
  },
  {
    title: 'Access control in SQL',
    schematic: <CodeBlock language="sql">{AccessControlCode}</CodeBlock>,
    description: (
      <span className={styles.cardDescription}>
        Pass in user attributes to SQL to control the access. Learn about{' '}
        <Link to="docs/api-building/access-control">access control</Link>.
      </span>
    ),
  },
  {
    title: 'Self-serve documentation and catalog',
    schematic: <img src={'./img/catalog_api_list.png'} />,
    description: (
      <span className={styles.cardDescription}>
        Automatically build API documentation (Swagger) and catalog for data
        consumers and web engineer. Learn about{' '}
        <Link to="docs/api-building/access-control">API documentation</Link> .
      </span>
    ),
  },
  {
    title: 'Connect from framework & applications',
    schematic: <img src={'./img/catalog_connect_page.png'} />,
    description: (
      <span className={styles.cardDescription}>
        Preview data and connect from your own framework and applications.
      </span>
    ),
  },
];

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.section}>
      <h1 className={`text--center ${styles.title}`}>What is VulcanSQL?</h1>
      <FeatureCard featureList={FeatureList} />
    </section>
  );
}
