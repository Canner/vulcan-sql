import Link from '@docusaurus/Link';
import React from 'react';
import styles from './styles.module.css';
import OverviewImageUrl from '@site/static/img/vulcan-overview.png';

const featureList = [
  {
    icon: require('@site/static/img/feature-1-icon.svg').default,
    title: 'Build APIs from SQL',
    description: 'Use only SQL to build your scalable and flexible APIs.',
  },
  {
    icon: require('@site/static/img/feature-2-icon.svg').default,
    title: 'Dynamic SQL generation',
    description:
      'Generate corresponding SQL based on personas and context on the fly.',
  },
  {
    icon: require('@site/static/img/feature-3-icon.svg').default,
    title: 'Scalable and Extendable',
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
        Build Analytics APIs from parameterized SQL
      </h1>
      <Link
        className={`button button--primary ${styles.getStartButton}`}
        to="./docs/quickstart"
      >
        Get started now
      </Link>
      <div className="container">
        <img src={OverviewImageUrl} alt="Overview of VulcanSQL" />
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
