import { ReactFlowInstance, useReactFlow } from 'reactflow';
import styled from 'styled-components';
import MarkerHandle from './MarkerHandle';

const NodeColumn = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px;
  color: var(--gray-9);

  svg {
    cursor: auto;
    flex-shrink: 0;
  }

  .adm-column-title {
    display: flex;
    align-items: center;
    min-width: 1px;
    svg {
      margin-right: 6px;
    }
    > span {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
`;

type ColumnProps = {
  id: string;
  type: string;
  name: string;
  style?: React.CSSProperties;
  icon: React.ReactNode;
  append?: React.ReactNode;
  onMouseEnter?: (reactflowInstance: ReactFlowInstance) => void;
  onMouseLeave?: (reactflowInstance: ReactFlowInstance) => void;
};
export default function Column(props: ColumnProps) {
  const {
    id,
    type,
    onMouseEnter,
    onMouseLeave,
    name,
    style = {},
    icon,
    append,
  } = props;
  const reactflowInstance = useReactFlow();
  const mouseEnter = onMouseEnter
    ? () => onMouseEnter(reactflowInstance)
    : undefined;
  const mouseLeave = onMouseLeave
    ? () => onMouseLeave(reactflowInstance)
    : undefined;

  return (
    <NodeColumn
      style={style}
      onMouseEnter={mouseEnter}
      onMouseLeave={mouseLeave}
    >
      <div className="adm-column-title">
        <span title={type}>{icon}</span>
        <span title={name}>{name}</span>
      </div>
      {append}
      <MarkerHandle id={id} />
    </NodeColumn>
  );
}
