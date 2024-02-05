import { memo, useCallback, useContext } from 'react';
import { CustomNodeProps, NodeBody, NodeHeader, StyledNode } from './utils';
import { LightningIcon, MetricIcon, MoreIcon } from '../../../utils/icons';
import MarkerHandle from './MarkerHandle';
import Column from './Column';
import { METRIC_TYPE, MetricColumn, Metric } from '../types';
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

  const renderColumns = useCallback(getColumns, []);
  return (
    <StyledNode>
      <NodeHeader className="dragHandle" color="var(--citrus-6)">
        <span className="adm-model-header">
          <MetricIcon />
          {data.originalData.name}
        </span>
        <span>
          {data.originalData.preAggregated ? (
            <Tooltip
              title={
                <>
                  Pre-aggregation
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
        {renderColumns(data.originalData.columns)}
      </NodeBody>
    </StyledNode>
  );
};

export default memo(MetricNode);

function getColumns(columns: MetricColumn[]) {
  return columns.map((column) => (
    <Column
      key={column.id}
      {...column}
      icon={getColumnTypeIcon(column.type)}
      append={
        <span style={{ color: 'var(--gray-7)' }}>
          {getMetricType(column.metricType)}
        </span>
      }
    />
  ));
}

function getMetricType(type: string) {
  return (
    {
      [METRIC_TYPE.TIME_GRAIN]: 'time_grain',
      [METRIC_TYPE.DIMENSION]: 'dim',
    }[type] || type
  );
}
