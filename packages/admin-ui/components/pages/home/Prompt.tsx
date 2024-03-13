import { Input, Button } from 'antd';
import styled from 'styled-components';
import PromptResult from '@vulcan-sql/admin-ui/components/pages/home/PromptResult';

const PromptStyle = styled.div`
  position: fixed;
  width: 768px;
  left: 50%;
  margin-left: calc(-384px + 140px);
  bottom: 12px;
`;

export default function Prompt() {
  return (
    <PromptStyle className="d-flex align-end bg-gray-2 p-3 border border-gray-3 rounded">
      <PromptResult data={[]} />
      <Input.TextArea
        size="large"
        autoSize
        placeholder="Ask to explore your data"
      />
      <Button type="primary" size="large" className="ml-3">
        Ask
      </Button>
    </PromptStyle>
  );
}
