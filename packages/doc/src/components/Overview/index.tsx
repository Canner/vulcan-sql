import Link from '@docusaurus/Link';
import React from 'react';
import styles from './styles.module.css';
import OverviewImageUrl from '@site/static/img/vulcan-overview.png';

const featureList = [
  {
    icon: require('@site/static/img/feature-1-icon.svg').default,
    title: 'Build API instantly',
    description:
      'Just use SQL that the data analyst is most familiar with to build API.',
  },
  {
    icon: require('@site/static/img/feature-2-icon.svg').default,
    title: 'Automate API development',
    description:
      'Let data analyst focus on data insights and save development time and cost.',
  },
  {
    icon: require('@site/static/img/feature-3-icon.svg').default,
    title: 'Easy to get data',
    description:
      'Provide self-serve catalog UI for data consumer to easily get data from applications.',
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
        Instant API on your data warehouse & data lake
      </h1>
      <Link
        className={`button button--primary ${styles.getStartButton}`}
        to="./docs/quickstart"
      >
        Get started now
      </Link>
      <div className="container">
        <img src={OverviewImageUrl} />
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
