import Link from '@docusaurus/Link';
import React from 'react';
import styles from './styles.module.css';

const VercelLogo =
  require('@site/static/img/vercel-logotype-light.svg').default;

export default function Sponsors(): JSX.Element {
  return (
    <div className={styles.container}>
      <div className={styles.vercel}>
        Powered by
        <Link to="https://vercel.com?utm_source=vulcan-sql-document&utm_campaign=oss">
          <VercelLogo className={styles.vercelLogo} />
        </Link>
      </div>
    </div>
  );
}
