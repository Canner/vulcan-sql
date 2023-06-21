import Link from '@docusaurus/Link';
import React from 'react';
import styles from './styles.module.css';
import OverviewImageUrl from '@site/static/img/vulcan-concept-light.png';

const featureList = [
  {
    icon: require('@site/static/img/feature-1-icon.svg').default,
    title: 'Create Robust APIs with SQL',
    description: 'Harness the simplicity of SQL to develop scalable and flexible APIs, tailor-made for your needs.',
  },
  {
    icon: require('@site/static/img/feature-2-icon.svg').default,
    title: 'Dynamic SQL Generation',
    description:
      'Generate context-specific SQL tailored to various personas in real time.',
  },
  {
    icon: require('@site/static/img/feature-3-icon.svg').default,
    title: 'Extendable and Scalable',
    description:
      'Modular and extendable with your custom business logic at scale.',
  },
];

export default function Overview(): JSX.Element {
  return (
    <section className={styles.overview}>
      <iframe
        src="https://ghbtns.com/github-btn.html?user=canner&repo=vulcan-sql&type=star&count=true&size=large"
        frameBorder="0"
        scrolling="0"
        width="150"
        height="30"
        title="GitHub"
      ></iframe>
      <h1 className={`text--center ${styles.title}`}>
        Build Data APIs From Parameterized SQL
      </h1>
      <Link
        className={`button button--primary ${styles.getStartButton}`}
        to="./docs/intro"
      >
        Get started now
      </Link>
      <div className="container">
        <img src={OverviewImageUrl} style={{ marginTop: '20px' }} alt="Overview of VulcanSQL" />
        <div className={`row ${styles.featureContainer}`}>
          {featureList.map((feature) => (
            <div
              className={`col col--4 text--center ${styles.feature}`}
              key={feature.title}
            >
              {feature.icon && <feature.icon />}
              <h3>{feature.title}</h3>
              <div>{feature.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
