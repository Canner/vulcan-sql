import styled from 'styled-components';
import { Breadcrumb as AntdBreadcrumb } from 'antd';
import { useRouter } from 'next/router';

const StyledBreadcrumb = styled(AntdBreadcrumb)`
  height: 100%;
  display: flex;
  align-items: center;

  li:not(:last-child) {
    cursor: pointer;
  }
`;

interface BreadcrumbProps {
  pathNames?: string[];
}

const pathNamespace = ['Catalog', '', ''];

export default function Breadcrumb(props: BreadcrumbProps) {
  const { pathNames = [] } = props;
  const router = useRouter();
  const composePathNames = [
    '',
    ...pathNamespace.map((item, index) => pathNames[index] || item),
  ];
  const splitPaths = router.asPath.split('/');
  const breadcrumbItems = splitPaths.map((item, index) => {
    const isParentPath = splitPaths.length - 1 !== index;
    const href = isParentPath
      ? `${splitPaths.slice(0, index).join('/')}/${item}`
      : null;
    const name = composePathNames[index] || '';
    return (
      <AntdBreadcrumb.Item
        key={item + index}
        onClick={() => (href ? router.push(href) : null)}
      >
        {name}
      </AntdBreadcrumb.Item>
    );
  });
  return <StyledBreadcrumb>{breadcrumbItems}</StyledBreadcrumb>;
}
