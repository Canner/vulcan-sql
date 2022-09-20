import React from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import { typography, TypographyProps, space, SpaceProps } from 'styled-system';

const StyledTitle = styled.div<TypographyProps & SpaceProps>`
  ${typography}
  ${space}
`;

type Props = {
  children: React.ReactNode;
  title: string;
};

const HeadTitle: React.FC<Props> = (props) => {
  return (
    <>
      <Head>
        <title>{props.title}</title>
      </Head>
      <StyledTitle fontSize={4} fontWeight={1} my={4}>
        {props.children}
      </StyledTitle>
    </>
  );
};

export default HeadTitle;
