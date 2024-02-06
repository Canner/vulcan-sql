import { memo, useCallback, useContext, useMemo } from 'react';
import Column, { ColumnTitle } from './Column';
import { CustomNodeProps, NodeBody, NodeHeader, StyledNode } from './utils';
import { MoreIcon, ModelIcon, PrimaryKeyIcon } from '../../../utils/icons';
import MarkerHandle from './MarkerHandle';
import { ModelColumn, Model } from '../types';
import { highlightEdges, highlightNodes, trimId } from '../utils';
import { getColumnTypeIcon } from '../../../utils/columnType';
import { DiagramContext } from '../Context';

export const ModelNode = ({ data }: CustomNodeProps<Model>) => {
  const context = useContext(DiagramContext);
  const onClick = () => {
    context?.onMoreClick({
      title: data.originalData.name,
      data: data.originalData,
    });
  };
  const columnType = useMemo(() => {
    const columnType = {
      columns: [] as ModelColumn[],
      relationColumns: [] as ModelColumn[],
    };
    data.originalData.columns.forEach((column) => {
      if (column?.relation) columnType.relationColumns.push(column);
      else columnType.columns.push(column);
    });
    return columnType;
  }, [data.originalData.columns]);

  const hasRelationshipTitle = !!columnType.relationColumns.length;
  const renderColumns = useCallback(
    (columns: ModelColumn[]) => getColumns(columns, data),
    [data.highlight]
  );

  return (
    <StyledNode>
      <NodeHeader className="dragHandle">
        <span className="adm-model-header">
          <ModelIcon />
          {data.originalData.name}
        </span>
        <MoreIcon onClick={onClick} />

        <MarkerHandle id={data.originalData.id} />
      </NodeHeader>
      <NodeBody draggable={false}>
        {renderColumns(columnType.columns)}
        {hasRelationshipTitle ? <ColumnTitle>Relations</ColumnTitle> : null}
        {renderColumns(columnType.relationColumns)}
      </NodeBody>
    </StyledNode>
  );
};

export default memo(ModelNode);

function getColumns(
  columns: ModelColumn[],
  data: CustomNodeProps<Model>['data']
) {
  return columns.map((column) => {
    const hasRelationship = !!column.relation;

    const onMouseEnter = useCallback((reactflowInstance: any) => {
      if (!hasRelationship) return;
      const { getEdges, setEdges, setNodes } = reactflowInstance;
      const edges = getEdges();
      const relatedEdge = edges.find(
        (edge: any) =>
          trimId(edge.sourceHandle) === column.id ||
          trimId(edge.targetHandle) === column.id
      );
      setEdges(highlightEdges([relatedEdge.id], true));
      setNodes(
        highlightNodes(
          [relatedEdge.source, relatedEdge.target],
          [trimId(relatedEdge.sourceHandle), trimId(relatedEdge.targetHandle)]
        )
      );
    }, []);
    const onMouseLeave = useCallback((reactflowInstance: any) => {
      if (!hasRelationship) return;
      const { setEdges, setNodes } = reactflowInstance;
      setEdges(highlightEdges([], false));
      setNodes(highlightNodes([], []));
    }, []);

    return (
      <Column
        key={column.id}
        {...column}
        style={
          data.highlight.includes(column.id)
            ? { background: 'var(--gray-3)' }
            : undefined
        }
        icon={hasRelationship ? <ModelIcon /> : getColumnTypeIcon(column.type)}
        append={column.isPrimaryKey && <PrimaryKeyIcon />}
        onMouseLeave={onMouseLeave}
        onMouseEnter={onMouseEnter}
      />
    );
  });
}
