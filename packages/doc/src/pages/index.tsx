import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import DiveIn from '@site/src/components/DiveIn';
import Overview from '../components/Overview';

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={siteConfig.title} description={siteConfig.tagline}>
      <main>
        <Overview />
        <DiveIn />
      </main>
    </Layout>
  );
}
