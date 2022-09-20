import React from 'react';
import { useRouter } from 'next/router';
import { Avatar, Breadcrumb, Dropdown, Layout as AntdLayout, Menu } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { upperFirst } from 'lodash';
import styled from 'styled-components';
import {
  space,
  SpaceProps,
  color,
  ColorProps,
  layout,
  LayoutProps,
  flexbox,
  FlexboxProps,
  border,
  BorderProps,
} from 'styled-system';
import { useAuth } from '@/lib/auth';

const { Header, Content } = AntdLayout;

const StyledHeader = styled(Header).withConfig({
  shouldForwardProp: (prop) =>
    ![
      'justifyContent',
      'alignItems',
      'borderBottom',
      'borderBottomColor',
      'borderBottomStyle',
    ].includes(prop),
})<ColorProps & LayoutProps & FlexboxProps & BorderProps>`
  && {
    ${layout}
    ${flexbox}
    ${color}
    ${border}
  }
`;

const StyledBreadcrumb = styled(Breadcrumb)<SpaceProps>`
  && {
    ${space}
    span {
      cursor: pointer;
    }
  }
`;

const StyledAvatar = styled(Avatar)<ColorProps & SpaceProps>`
  && {
    ${color}
    ${space}
    cursor: pointer;
  }
`;

const StyledContent = styled(Content)<ColorProps & SpaceProps & LayoutProps>`
  && {
    ${color}
    ${space}
    ${layout}
  }
`;

type Props = {
  children?: React.ReactNode;
};

type PathParts = {
  name: string;
  path: string;
};

const generatePathParts = (pathStr: string): PathParts[] => {
  const pathWithoutQuery = pathStr.split('?')[0];
  return pathWithoutQuery
    .split('/')
    .filter((v) => v.length > 0)
    .reduce((pV, cV, currentIndex) => {
      return [
        ...pV,
        {
          name: cV,
          path:
            currentIndex > 0
              ? `${pV[currentIndex - 1].path || ''}/${cV}`
              : `/${cV}`,
        },
      ];
    }, []);
};

const Layout: React.FC<Props> = (props) => {
  const router = useRouter();
  const path: PathParts[] = generatePathParts(router.asPath);
  const { logout, user } = useAuth();

  const breadcrumbItem = path.map(({ name, path }) => (
    <Breadcrumb.Item key={path} onClick={() => router.push(`/${path}`)}>
      {upperFirst(name)}
    </Breadcrumb.Item>
  ));

  const menu = (
    <Menu
      items={[
        {
          key: 'profile',
          label: user ? user.username : 'Guest',
        },
        {
          key: 'logout',
          label: user ? (
            <div onClick={logout}>Log out</div>
          ) : (
            <div
              onClick={() =>
                router.push({
                  pathname: '/login',
                })
              }
            >
              Log in
            </div>
          ),
        },
      ]}
    />
  );

  return (
    <AntdLayout>
      <StyledHeader
        display="flex"
        height={48}
        justifyContent="space-between"
        alignItems="center"
        bg="neutralColor1"
        borderBottom={1}
        borderBottomColor="borderColor1"
        borderBottomStyle="solid"
      >
        <StyledBreadcrumb my={2}>{breadcrumbItem}</StyledBreadcrumb>
        <Dropdown overlay={menu} placement="bottomRight">
          {user ? (
            <StyledAvatar my={2} color="neutralColor1" bg="primaryColor1">
              {user.username.charAt(0)}
            </StyledAvatar>
          ) : (
            <Avatar icon={<UserOutlined />} />
          )}
        </Dropdown>
      </StyledHeader>
      <StyledContent bg="neutralColor1" px="50px" height="calc(100% - 48px)">
        {props.children}
      </StyledContent>
    </AntdLayout>
  );
};

export default Layout;
