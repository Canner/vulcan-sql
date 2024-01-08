import { JOIN_TYPE } from '../types';
import { Tooltip } from 'antd';
import { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getSmoothStepPath,
} from 'reactflow';
import styled from 'styled-components';

const Joint = styled.div`
  position: absolute;
  width: 30px;
  height: 30px;
  opacity: 0;
`;

const StyledTooltip = styled(Tooltip)`
  .ant-tooltip-inner {
    background-color: var(--gray-8);
  }
`;

const getJoinTypeText = (joinType: string) =>
  ({
    [JOIN_TYPE.ONE_TO_MANY]: '1-N',
    [JOIN_TYPE.MANY_TO_ONE]: 'N-1',
    [JOIN_TYPE.ONE_TO_ONE]: '1-1',
  }[joinType] || 'Unknown');

const ModelEdge = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerStart,
  markerEnd,
  data,
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const isTooltipShow = data.highlight;
  const style = isTooltipShow
    ? {
        stroke: 'var(--gray-8)',
        strokeWidth: 1.2,
      }
    : { stroke: 'var(--gray-5)' };

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerStart={markerStart}
        markerEnd={markerEnd}
        style={style}
      />
      <EdgeLabelRenderer>
        <StyledTooltip
          placement="bottom"
          title={
            <div>
              <div>Relation: {getJoinTypeText(data.relationship.joinType)}</div>
              <div>Condition: {data.relationship.condition}</div>
            </div>
          }
          visible={isTooltipShow}
          overlayStyle={{ maxWidth: '100%', pointerEvents: 'none' }}
        >
          <Joint
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            }}
          />
        </StyledTooltip>
      </EdgeLabelRenderer>
    </>
  );
};

export default memo(ModelEdge);
