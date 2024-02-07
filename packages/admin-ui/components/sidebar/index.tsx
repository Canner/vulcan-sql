import styled from 'styled-components';
import { AdaptedData } from '@vulcan-sql/admin-ui/utils/data';
import Modeling from './Modeling';

const Layout = styled.div`
  position: relative;
  min-height: 100%;
  background-color: var(--gray-3);
  color: var(--gray-8);
  padding-bottom: 24px;
  overflow-x: hidden;
`;

interface Props {
  data: AdaptedData;
  onSelect?: (selectKeys) => void;
}

// TODO: should consider explore's sidebar
export default function Sidebar(props: Props) {
  return (
    <Layout>
      <Modeling {...props} />
    </Layout>
  );
}
