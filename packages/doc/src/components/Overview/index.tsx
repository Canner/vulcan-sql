import Link from '@docusaurus/Link';
import React, { useCallback, useMemo, useState } from 'react';
import styles from './styles.module.css';
import VulcanSQLProcessImageUrl from '@site/static/img/vulcan_process.png';
import VulcanSQLProcessMobileImageUrl from '@site/static/img/vulcan_process_m.png';

const users = [
  {
    type: 'Non-Tech Users',
    title: 'Self-Service Catalog',
    description: (
      <span>
        Even users with no technical background can connect to their
        spreadsheets without the need for additional plugins or drivers. This is
        applicable for both Google Spreadsheets and MS Excel.
        <span className={styles.radio_description_footer}>
          <img
            src={'./img/icon_excel.svg'}
            className={styles.inline_logo}
            alt="dbt logo"
          />
          <img
            src={'./img/icon_google_sheet.svg'}
            className={styles.inline_logo}
            alt="dbt logo"
          />
        </span>
      </span>
    ),
    icon: require('@site/static/img/icon_catalog.svg').default,
    imgSrc: './img/catalog.png',
  },
  {
    type: 'Developer',
    title: 'API Docs',
    description: (
      <>
        Developers can familiarize themselves with APIs without the need to
        repeatedly consult analytics engineers.
        <span className={styles.radio_description_footer}>
          <img
            src={'./img/icon_react.svg'}
            className={styles.inline_logo}
            alt="dbt logo"
          />
          <img
            src={'./img/icon_vue.svg'}
            className={styles.inline_logo}
            alt="dbt logo"
          />
        </span>
      </>
    ),
    icon: require('@site/static/img/icon_aip_docs.svg').default,
    imgSrc: './img/api_docs.png',
  },
];

export default function Overview(): JSX.Element {
  const [userType, setUserType] = useState(null);
  const handleRadioChange = (event) => {
    setUserType(event.target.value);
  };

  const userUiImgSrc = useMemo(
    () =>
      users.find(({ type }) => type === userType)?.imgSrc ||
      './img/vulcan_share_apidocs.gif',
    [userType]
  );

  const RadioTabs = useCallback(() => {
    return (
      <div className={styles.radio_tabs}>
        {users.map(({ type, title, description, icon: Icon }, i) => {
          return (
            <div
              key={i}
              data-is-active={userType ? userType === type : i === 0}
            >
              <input
                type="radio"
                id={`radio_tab_user_${i}`}
                name="radio_user_options"
                onChange={handleRadioChange}
                value={type}
                defaultChecked={userType ? userType === type : i === 0}
              />
              <label htmlFor={`radio_tab_user_${i}`}>
                <span className={`badge badge--primary ${styles.user_tag}`}>
                  {type}
                </span>
                <Icon className={styles.inline_logo} />
                {title}
              </label>
              <p className={styles.radio_description}>{description}</p>
            </div>
          );
        })}
      </div>
    );
  }, [users, userType]);

  return (
    <section className={styles.overview}>
      <iframe
        src="https://ghbtns.com/github-btn.html?user=canner&repo=vulcan-sql&type=star&count=true&size=large"
        frameBorder="0"
        scrolling="0"
        width="160"
        height="30"
        title="GitHub"
      ></iframe>
      <h1 className={`text--center ${styles.title}`}>
        Create and Share <span className={styles.gradient_text}>Data</span>{' '}
        <span className={styles.gradient_text}>APIs</span> Fast.{' '}
        <br className={`${styles.title_line_break}`} />
        Made for Analytics Engineers.
      </h1>
      <div className={`text--center ${styles.description}`}>
        VulcanSQL turns your SQL templates into data APIs for efficient data
        sharing.
        <br />
        No backend skills required. Empower your data sharing, faster.
      </div>
      <div className={styles.banner_button_content}>
        <Link
          className={`button button--primary ${styles.banner_button} ${styles.getStartButton}`}
          to="./docs/get-started/first-api"
        >
          Get Started Now
        </Link>
        <Link
          className={`button button--outline ${styles.banner_button} ${styles.view_demo_button}`}
          to="https://codesandbox.io/p/sandbox/vulcansql-demo-wfd834"
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

      <div className={styles.card}>
        <div className={`col col--6 ${styles.text_container}`}>
          <h3 className={`${styles.card_title}`}>
            Fewer Ad-hoc Requests
            <br />
            More
            <span className={styles.gradient_text}> Self-Service </span>.
          </h3>
          <p className={`${styles.card_description}`}>
            With VulcanSQL, analytics engineers can control access to the data
            warehouse using data APIs. Additionally, VulcanSQL{' '}
            <span className={styles.highlight}>
              automatically generates a 'self-service' interface.
            </span>{' '}
            This allows users to navigate through data and connect instantly
            from spreadsheets.
          </p>
          <RadioTabs />
        </div>
        <div className={`col col--6 ${styles.image_container}`}>
          <img className={styles.radius} src={userUiImgSrc} />
        </div>
      </div>
    </section>
  );
}
