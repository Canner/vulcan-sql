import React from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';
import relativeTime from 'dayjs/plugin/relativeTime.js';
import Carousel from '../share/Carousel';
import GITHUB_DATA from './data';
dayjs.extend(relativeTime);

const Discord = require('@site/static/img/discord.svg').default;
const GitHub = require('@site/static/img/github.svg').default;

enum EmojisType {
  Eyes = 'eyes',
  Heart = 'heart',
  Hooray = 'hooray',
  Laugh = 'laugh',
  Rocket = 'rocket',
  Thumbs_Up = 'thumbsUp',
}

const emojiImgSrc = (emoji: string) => {
  switch (emoji) {
    case EmojisType.Eyes:
      return './img/eyes.png';

    case EmojisType.Heart:
      return './img/heart.png';

    case EmojisType.Hooray:
      return './img/hooray.png';

    case EmojisType.Laugh:
      return './img/laugh.png';

    case EmojisType.Rocket:
      return './img/rocket.png';

    case EmojisType.Thumbs_Up:
      return './img/thumbs_up.png';
  }
};

interface GitHubIssueItem {
  content: any;
  html_url: string;
  title: string;
  updated_at: string;
  url: string;
  user: {
    avatar_url: string;
    login: string;
  };
  emojis: Record<string, number>;
}

function GitHubCard({
  content,
  html_url,
  title,
  updated_at,
  user: { avatar_url: avatarUrl, login: uid },
  emojis,
}: GitHubIssueItem): JSX.Element {
  return (
    <div className={`col col--4 ${styles.gitHubCard}`}>
      <Link className={styles.cardMeta} to={html_url}>
        <div className={clsx('card', styles.cardBlock)}>
          <div className={`${styles.cardAvatarBlock}`}>
            <img
              alt={uid}
              className={`avatar__photo ${styles.cardAvatar}`}
              src={avatarUrl}
              loading="lazy"
            />
            <div className={clsx('avatar__intro', styles.cardMeta)}>
              <strong className="avatar__name">{uid}</strong>
              <span>{dayjs(updated_at).fromNow()}</span>
            </div>
            <img
              src="./img/github-icon.png"
              className={`avatar__photo ${styles.gitHubIcon}`}
              alt="GitHub Icon"
            />
          </div>
          <div className={styles.cardContent}>
            <div className={styles.gitHubTitle}>
              <strong>{title}</strong>
            </div>
            <div className={styles.gitHubContent}>
              <p>{content}</p>
            </div>
            <div className={styles.gitHubEmojis}>
              {Object.keys(emojis).map((emoji) => (
                <div key={emoji} className={styles.gitHubEmoji}>
                  <img key={emoji} src={emojiImgSrc(emoji)} alt={emoji} />
                  <span>{emojis[emoji]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

function GitHubSection({ data: gitHubIssueColumns }) {
  return (
    <div className={clsx(styles.githubSection)}>
      <Carousel>
        {gitHubIssueColumns.map((item: GitHubIssueItem) => (
          <GitHubCard {...item} key={item.url} />
        ))}
      </Carousel>
    </div>
  );
}

export default function Community(): JSX.Element {
  return (
    <section className={styles.communitySection}>
      <h1 className={`text--center ${styles.title}`}>Join the Community</h1>
      <div className={`text--center ${styles.descriptionBlock}`}>
        <div className={`text--center ${styles.description}`}>
          Join the discord group to chat with the developers and directly
          connect with the VulcanSQL team.
        </div>
        <div className={`buttons ${styles.buttonContainer}`}>
          <Link
            className={`button button--outline ${styles.actionButton}`}
            to="https://discord.gg/ztDz8DCmG4"
          >
            <Discord className={styles.actionIcon} role="img" />
            Discord
          </Link>
          <Link
            className={`button button--outline ${styles.actionButton}`}
            to="https://github.com/Canner/vulcan-sql"
          >
            <img className={`${styles.actionIcon} ${styles.gitHub_button__dark}`} src="./img/github_white.svg" />
            <img className={`${styles.actionIcon} ${styles.gitHub_button__light}`} src='./img/github.svg' />
            GitHub
          </Link>
        </div>
      </div>
      <GitHubSection data={GITHUB_DATA} />
    </section>
  );
}
