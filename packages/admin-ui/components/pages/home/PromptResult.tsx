import styled from 'styled-components';
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';

const ResultStyle = styled.div`
  position: absolute;
  bottom: calc(100% + 12px);
  left: 0;
  width: 100%;
`;

interface Props {
  data: any[];
}

export default function PromptResult(props: Props) {
  const { data = [] } = props;
  return (
    <ResultStyle className="border border-gray-3 p-3">
      <div>
        <CheckCircleOutlined className="green-5" /> {data.length} result(s)
        found
      </div>
    </ResultStyle>
  );
}
