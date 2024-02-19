import { useRouter } from 'next/router';
import styled from 'styled-components';
import { AdaptedData } from '@vulcan-sql/admin-ui/utils/data';
import { Path } from '@vulcan-sql/admin-ui/utils/enum';
import Exploration, { ExplorationData } from './Exploration';
import Modeling from './Modeling';

const Layout = styled.div`
  position: relative;
  min-height: 100%;
  background-color: var(--gray-3);
  color: var(--gray-8);
  padding-bottom: 24px;
  overflow-x: hidden;
`;

interface ModelingSidebarProps {
  data: AdaptedData;
  onSelect: (selectKeys) => void;
}

interface ExploreSidebarProps {
  data: ExplorationData[];
  onSelect: (selectKeys) => void;
}

type Props = ModelingSidebarProps | ExploreSidebarProps;

const DynamicSidebar = (
  props: Props & {
    pathname: string;
  }
) => {
  const { pathname, ...restProps } = props;

  if (pathname.startsWith(Path.Explore)) {
    return <Exploration {...(restProps as ExploreSidebarProps)} />;
  }

  if (pathname.startsWith(Path.Modeling)) {
    return <Modeling {...(restProps as ModelingSidebarProps)} />;
  }

  return null;
};

export default function Sidebar(props: Props) {
  const router = useRouter();

  return (
    <Layout>
      <DynamicSidebar {...props} pathname={router.pathname} />
    </Layout>
  );
}
