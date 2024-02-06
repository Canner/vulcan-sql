import { memo, useCallback, useContext } from 'react';
import { CustomNodeProps, NodeBody, NodeHeader, StyledNode } from './utils';
import { LightningIcon, MetricIcon, MoreIcon } from '../../../utils/icons';
import MarkerHandle from './MarkerHandle';
import Column, { ColumnTitle } from './Column';
import { MetricColumn, Metric } from '../types';
import { getColumnTypeIcon } from '../../../utils/columnType';
import { DiagramContext } from '../Context';
import { Tooltip } from 'antd';

export const MetricNode = ({ data }: CustomNodeProps<Metric>) => {
  const context = useContext(DiagramContext);
  const onClick = () => {
    context?.onMoreClick({
      title: data.originalData.name,
      data: data.originalData,
    });
  };

  const hasDimensions = !!data.originalData.dimensions;
  const hasMeasures = !!data.originalData.measures;
  const hasTimeGrains = !!data.originalData.timeGrains;
  const hasWindows = !!data.originalData.windows;

  const renderColumns = useCallback(getColumns, []);
  return (
    <StyledNode>
      <NodeHeader className="dragHandle" color="var(--citrus-6)">
        <span className="adm-model-header">
          <MetricIcon />
          {data.originalData.name}
        </span>
        <span>
          {data.originalData.cached ? (
            <Tooltip
              title={
                <>
                  Cached
                  {data.originalData.refreshTime
                    ? `: refresh every ${data.originalData.refreshTime}`
                    : null}
                </>
              }
              placement="top"
            >
              <LightningIcon />
            </Tooltip>
          ) : null}
          <MoreIcon style={{ cursor: 'pointer' }} onClick={onClick} />
        </span>

        <MarkerHandle id={data.originalData.id} />
      </NodeHeader>
      <NodeBody draggable={false}>
        {hasDimensions ? <ColumnTitle>Dimensions</ColumnTitle> : null}
        {renderColumns(data.originalData.dimensions || [])}

        {hasMeasures ? <ColumnTitle>Measures</ColumnTitle> : null}
        {renderColumns(data.originalData.measures || [])}

        {hasTimeGrains ? <ColumnTitle>Time Grains</ColumnTitle> : null}
        {renderColumns(data.originalData.timeGrains || [])}

        {hasWindows ? <ColumnTitle>Windows</ColumnTitle> : null}
        {renderColumns(data.originalData.windows || [])}
      </NodeBody>
    </StyledNode>
  );
};

export default memo(MetricNode);

function getColumns(columns: MetricColumn[]) {
  return columns.map((column) => (
    <Column key={column.id} {...column} icon={getColumnTypeIcon(column.type)} />
  ));
}
