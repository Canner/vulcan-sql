import { memo, useCallback, useContext } from 'react';
import Column, { ColumnTitle } from './Column';
import { CustomNodeProps, NodeBody, NodeHeader, StyledNode } from './utils';
import { MoreIcon, ModelIcon, PrimaryKeyIcon } from '../../../utils/icons';
import MarkerHandle from './MarkerHandle';
import { ModelColumn, Model } from '../types';
import { highlightEdges, highlightNodes, trimId } from '../utils';
import { getColumnTypeIcon } from '../../../utils/columnType';
import { DiagramContext } from '../Context';
import CustomDropdown from '../CustomDropdown';

export const ModelNode = ({ data }: CustomNodeProps<Model>) => {
  const context = useContext(DiagramContext);
  const onMoreClick = (type: 'edit' | 'delete') => {
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

  const hasRelationTitle = !!data.originalData.relationFields.length;
  const renderColumns = useCallback(
    (columns: ModelColumn[]) => getColumns(columns, data),
    [data.highlight]
  );

  return (
    <StyledNode onClick={onNodeClick}>
      <NodeHeader className="dragHandle">
        <span className="adm-model-header">
          <ModelIcon />
          {data.originalData.name}
        </span>
        <CustomDropdown onMoreClick={onMoreClick}>
          <MoreIcon onClick={(e) => e.stopPropagation()} />
        </CustomDropdown>

        <MarkerHandle id={data.originalData.id} />
      </NodeHeader>
      <NodeBody draggable={false}>
        {renderColumns([
          ...data.originalData.fields,
          ...data.originalData.calculatedFields,
        ])}
        {hasRelationTitle ? <ColumnTitle>Relations</ColumnTitle> : null}
        {renderColumns(data.originalData.relationFields)}
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
    const hasRelation = !!column.relation;

    const onMouseEnter = useCallback((reactflowInstance: any) => {
      if (!hasRelation) return;
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
      if (!hasRelation) return;
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
        icon={
          hasRelation ? <ModelIcon /> : getColumnTypeIcon(column.type || '')
        }
        append={column.isPrimaryKey && <PrimaryKeyIcon />}
        onMouseLeave={onMouseLeave}
        onMouseEnter={onMouseEnter}
      />
    );
  });
}
