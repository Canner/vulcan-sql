import Link from '@docusaurus/Link';
import React from 'react';
import styles from './styles.module.css';
import VulcanSQLProcessImageUrl from '@site/static/img/vulcan_process.png';
import VulcanSQLProcessMobileImageUrl from '@site/static/img/vulcan_process_m.png';

export default function Overview(): JSX.Element {
  return (
    <section className={styles.overview}>
      <iframe
        src="https://ghbtns.com/github-btn.html?user=canner&repo=vulcan-sql&type=star&count=true"
        frameBorder="0"
        scrolling="0"
        width="91"
        height="20"
        title="GitHub"
      ></iframe>
      <h1 className={`text--center ${styles.title}`}>
        Create and Share <strong>Data</strong> <strong>APIs</strong> Fast.
        <br />
        Made for Analytics Engineers.
      </h1>
      <div className={`text--center ${styles.description}`}>
        VulcanSQL turns your SQL templates into data APIs for efficient data
        sharing.
        <br />
        No backend skills required. Empower your data sharing, faster.
      </div>
      <div className={styles.banner_button}>
        <Link
          className={`button button--primary ${styles.getStartButton}`}
          to="./docs/get-started/first-api"
        >
          Get Started Now
        </Link>
        <Link
          className={`button button--outline ${styles.view_demo_button}`}
          to="https://catalog-server.vercel.app/catalog"
        >
          View a Demo
        </Link>
      </div>
      <picture className={styles.banner_image}>
        <source
          srcSet={VulcanSQLProcessMobileImageUrl}
          media="(max-width: 414px)"
        />
        <img src={VulcanSQLProcessImageUrl} alt="Process of VulcanSQL" />
      </picture>
    </section>
  );
}
