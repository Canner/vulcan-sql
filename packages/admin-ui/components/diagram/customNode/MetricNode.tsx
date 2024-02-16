import { memo, useCallback, useContext } from 'react';
import { Tooltip } from 'antd';
import { isEmpty } from 'lodash';
import { CustomNodeProps, NodeBody, NodeHeader, StyledNode } from './utils';
import MarkerHandle from './MarkerHandle';
import { DiagramContext } from '../Context';
import Column, { ColumnTitle } from './Column';
import CustomDropdown from '../CustomDropdown';
import {
  LightningIcon,
  MetricIcon,
  MoreIcon,
} from '@vulcan-sql/admin-ui/utils/icons';
import { MORE_ACTION } from '@vulcan-sql/admin-ui/utils/enum';
import { MetricColumnData, MetricData } from '@vulcan-sql/admin-ui/utils/data';
import { getColumnTypeIcon } from '@vulcan-sql/admin-ui/utils/columnType';

export const MetricNode = ({ data }: CustomNodeProps<MetricData>) => {
  const context = useContext(DiagramContext);
  const onMoreClick = (type: MORE_ACTION) => {
    context?.onMoreClick({
      type,
      title: data.originalData.name,
      data: data.originalData,
    });
  };
  const onNodeClick = () => {
    context?.onNodeClick({
      title: data.originalData.name,
      data: data.originalData,
    });
  };
  const hasDimensions = !isEmpty(data.originalData.dimensions);
  const hasMeasures = !isEmpty(data.originalData.measures);
  const hasTimeGrains = !isEmpty(data.originalData.timeGrains);
  const hasWindows = !isEmpty(data.originalData.windows);

  const renderColumns = useCallback(getColumns, []);
  return (
    <StyledNode onClick={onNodeClick}>
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
              <LightningIcon className="cursor-pointer" />
            </Tooltip>
          ) : null}
          <CustomDropdown onMoreClick={onMoreClick}>
            <MoreIcon
              style={{ marginLeft: 4 }}
              onClick={(e) => e.stopPropagation()}
            />
          </CustomDropdown>
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

function getColumns(columns: MetricColumnData[]) {
  return columns.map((column) => (
    <Column
      key={column.id}
      {...column}
      icon={getColumnTypeIcon({ type: column.type })}
    />
  ));
}
