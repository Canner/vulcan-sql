import React from 'react';
import styles from './styles.module.css';
import clsx from 'clsx';

export interface FratureData {
  title: string | JSX.Element;
  description: string | JSX.Element;
  schematic: JSX.Element;
}

const CardTitle: React.FC<{ content: string | JSX.Element }> = ({
  content,
}) => {
  if (typeof content === 'string' || content instanceof String) {
    return <div className={`${styles.cardTitle}`}>{content}</div>;
  }
  return content;
};

const CardDescription: React.FC<{ content: string | JSX.Element }> = ({
  content,
}) => {
  if (typeof content === 'string' || content instanceof String) {
    return <span className={`${styles.cardDescription}`}>{content}</span>;
  }
  return content;
};

const FeatureCard: React.FC<{ featureList: FratureData[] }> = (props) => {
  const { featureList } = props;
  return (
    <>
      {featureList.map(({ title, description, schematic }, i) => (
        <div key={i} className={`${clsx('col col--12')} ${styles.card}`}>
          <div className={`${clsx('col col--12')} ${styles.cardContent} row`}>
            <div
              className={`${clsx('col col--6')} ${
                styles.cardTextBlock
              }  text--left`}
            >
              <CardTitle content={title} />
              <CardDescription content={description} />
            </div>
            <div
              className={`${clsx('col col--6')} ${styles.cardSchematicBlock}`}
            >
              {schematic}
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default FeatureCard;
