import React, { useCallback, useMemo, useState } from 'react';
import styles from './styles.module.css';
import Link from '@docusaurus/Link';
import clsx from 'clsx';
import Carousel from '../share/Carousel';

enum ShareType {
  API_Documentation = 'API Documentation',
  Data_Catalog = 'Data Catalog',
  Connect_from_Application = 'Connect from Application',
}

const shareSessions = [
  {
    title: ShareType.API_Documentation,
    description: 'Automatically built API documentation based on OpenAPI.',
    icon: require('@site/static/img/icon_aip_docs.svg').default,
  },
  {
    title: ShareType.Data_Catalog,
    description: 'Extract data from your API without needing SQL knowledge.',
    icon: require('@site/static/img/icon_catalog.svg').default,
  },
  {
    title: ShareType.Connect_from_Application,
    description:
      'VulcanSQL enables seamless data sharing and integration within your known workflow.',
    icon: require('@site/static/img/icon_application.svg').default,
  },
];

const StyleLink = ({
  title = 'Learn more > ',
  link,
}: {
  title?: string;
  link: string;
}) => (
  <Link to={link} className={styles.link}>
    {title}
  </Link>
);

export default function HomepageFeatures(): JSX.Element {
  const [shareSectionValue, setShareSectionValue] = useState(null);
  const handleRadioChange = (event) => {
    setShareSectionValue(event.target.value);
  };

  const shareSessionsImgSrc = useMemo(() => {
    switch (shareSectionValue) {
      case ShareType.API_Documentation:
        return './img/vulcan_share_apidocs.gif';
      case ShareType.Data_Catalog:
        return './img/vulcan_share_datacatalog.gif';
      case ShareType.Connect_from_Application:
        return './img/vulcan_share_excel.gif';
      default:
        return './img/vulcan_share_apidocs.gif';
    }
  }, [shareSectionValue]);

  const RadioTabs = useCallback(() => {
    return (
      <div className={styles.radioTabs}>
        {shareSessions.map(({ title, description, icon: Icon }, i) => {
          return (
            <div
              key={i}
              data-is-active={
                shareSectionValue ? title === shareSectionValue : i === 0
              }
            >
              <input
                type="radio"
                id={`radio_tab_${i}`}
                name="radio-options"
                defaultChecked={
                  shareSectionValue ? shareSectionValue === title : i === 0
                }
                onChange={handleRadioChange}
                value={title}
              />
              <label htmlFor={`radio_tab_${i}`}>
                <Icon className={styles.inlineLogo} />
                {title}
              </label>
              <p>{description}</p>
            </div>
          );
        })}
      </div>
    );
  }, [shareSessions, shareSectionValue]);

  return (
    <section className={styles.section}>
      <h2 className={`text--center ${styles.title}`}>How VulcanSQL Works</h2>
      {/* Build */}
      <div className={styles.card}>
        <div className={`${clsx('col col--6')} ${styles.textContainer}`}>
          <h3 className={`${styles.cardTitle}`}>Build</h3>
          <p className={`${styles.cardDescription}`}>
            VulcanSQL offers a development experience similar to{' '}
            <img
              src={'./img/dbt.png'}
              className={styles.inlineLogo}
              alt="dbt logo"
            />
            <span className={styles.bold}>dbt</span>. Just insert variables into
            your templated SQL. VulcanSQL accepts input from your API and{' '}
            <span className={styles.highlight}>
              generates SQL statements on the fly
            </span>
            .
          </p>
        </div>
        <div
          className={`${clsx('col col--6')} ${styles.imageContainer} ${
            styles.cardContent
          }`}
        >
          <img src={'./img/build.png'} />
        </div>

        {/* API Best Practices at Your Fingertips */}
        <div className={styles.gallery}>
          <div className={styles.gallery_title_content}>
            <h4 className={styles.gallery_title}>
              API Best Practices at Your Fingertips
            </h4>
            <StyleLink link="https://vulcansql.com/docs/api-plugin/overview" />
          </div>

          <Carousel>
            <img className={clsx('col col--4')} src={'./img/validation.png'} />
            <img
              className={clsx('col col--4')}
              src={'./img/error_response.png'}
            />
            <img
              className={clsx('col col--4')}
              src={'./img/column_level_access_control.png'}
            />
          </Carousel>
        </div>
      </div>

      {/* Accelerate */}
      <div className={styles.card}>
        <div className={`${clsx('col col--6')} ${styles.textContainer}`}>
          <h3 className={`${styles.cardTitle}`}>Accelerate</h3>
          <p className={`${styles.cardDescription}`}>
            VulcanSQL uses{' '}
            <img
              src={'./img/duck_db.png'}
              className={styles.inlineLogo}
              alt="dbt logo"
            />
            <span className={styles.bold}>DuckDB</span> as a caching layer,{' '}
            <span className={styles.highlight}>
              boosting your query speed and API response time{' '}
            </span>
            . This means faster, smoother data APIs for you and less strain on
            your data sources.
          </p>
          <StyleLink link="https://vulcansql.com/docs/develop/cache" />
        </div>
        <div className={`${clsx('col col--6')} ${styles.imageContainer}`}>
          <img src={'./img/accelerate.png'} />
        </div>
      </div>

      {/* Deploy */}
      <div className={styles.card}>
        <div className={`${clsx('col col--6')} ${styles.textContainer}`}>
          <h3 className={`${styles.cardTitle}`}>Deploy</h3>
          <p className={`${styles.cardDescription}`}>
            VulcanSQL offers{' '}
            <span className={styles.highlight}>
              flexible deployment options
            </span>{' '}
            - whether you prefer Docker or command-based setups. Our 'package'
            command assists in bundling your assets, ensuring a smooth
            transition from development to deployment of your data APIs.
          </p>
          <div className={styles.links}>
            <StyleLink
              title="Docker > "
              link="https://vulcansql.com/docs/deployment#running-production-servers-with-docker-or-other-container-runtimes"
            />
            <StyleLink
              title="Node.js > "
              link="https://vulcansql.com/docs/deployment#running-production-servers-with-nodejs"
            />
            <StyleLink
              title="Command > "
              link="https://vulcansql.com/docs/deployment"
            />
          </div>
        </div>
        <div className={`${clsx('col col--6')} ${styles.imageContainer}`}>
          <img
            className={styles.radius}
            src={'./img/vulcan_docker_build.gif'}
          />
        </div>
      </div>

      {/* Share */}
      <div className={styles.card}>
        <div className={`${clsx('col col--5')} ${styles.textContainer}`}>
          <h3 className={`${styles.cardTitle}`}>Share</h3>
          <p className={`${styles.cardDescription}`}>
            VulcanSQL offers many data sharing options,{' '}
            <span className={styles.highlight}>
              seamlessly integrating your data into familiar applications
            </span>{' '}
            within your workflow.
          </p>
          <RadioTabs />
        </div>
        <div className={`${clsx('col col--7')} ${styles.imageContainer}`}>
          <img className={styles.radius} src={shareSessionsImgSrc} />
        </div>
      </div>
    </section>
  );
}
