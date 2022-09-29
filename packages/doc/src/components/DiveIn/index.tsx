import React from 'react';
import styles from './styles.module.css';
import clsx from 'clsx';
import Link from '@docusaurus/Link';

const Discord = require('@site/static/img/discord.svg').default;
const Vulcan = require('@site/static/img/vulcan.svg').default;

const diveInActions = [
  {
    icon: <Discord className={`${styles.actionIcon} `} role="img" />,
    title: 'Join our developer community',
    description:
      'Join the discord group to chat with the developers and connect directly with the VulcanSQL Team',
    takeActions: (
      <div className={styles.actionLinks}>
        <Link to="https://github.com/Canner/vulcan-sql">Go to Github &gt;</Link>
        <Link to="https://discord.gg/ztDz8DCmG4">Join Discord &gt;</Link>
      </div>
    ),
  },
  {
    icon: (
      <Vulcan
        className={`${styles.actionIcon} ${styles.vulcanIcon}`}
        role="img"
      />
    ),
    title: 'Get started to try VulcanSQL',
    description: 'Read our documentation and install VulcanSQL now.',
    takeActions: (
      <Link
        className={`button button--primary ${styles.actionButton}`}
        to="./docs/quickstart"
      >
        Get started now
      </Link>
    ),
  },
];

export default function DiveIn(): JSX.Element {
  return (
    <section className={styles.diveIn}>
      <h1 className={`text--center ${styles.title}`}>Ready to dive in?</h1>
      <div className="container">
        <div className={`row ${styles.diveInActionContainer}`}>
          {diveInActions.map((action) => (
            <div
              className={`${clsx('col col--5')} ${styles.diveInAction}`}
              key={action.title}
            >
              {action.icon}
              <h3 className={styles.actionTitle}>{action.title}</h3>
              <div className={styles.actionDescription}>
                {action.description}
              </div>
              {action.takeActions}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
