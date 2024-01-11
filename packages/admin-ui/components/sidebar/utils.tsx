import { DataNode } from 'antd/lib/tree';
import { getColumnTypeIcon } from '@vulcan-sql/admin-ui/utils/columnType';
import {
  MetricIcon,
  ModelIcon,
  PrimaryKeyIcon,
  RelationshipIcon,
} from '@vulcan-sql/admin-ui/utils/icons';
import { TitleNode } from './TitleNode';
import { ModelColumnData, ModelData } from '@vulcan-sql/admin-ui/utils/data/model';

type TreeNode = DataNode;

const ParentNode = ({ title }) => {
  return <span>{title}</span>;
};

const ColumnNode = ({ title, relationship, primary }) => {
  const append = (
    <>
      {relationship && (
        <span
          className="gml-node-relationship"
          title={`${relationship.name}: ${relationship.joinType}`}
        >
          <RelationshipIcon />
        </span>
      )}
      {primary && (
        <span className="gml-node-primary" title="Primary Key">
          <PrimaryKeyIcon />
        </span>
      )}
    </>
  );

  return <TitleNode title={title} append={append} />;
};

const MetricColumnNode = ({ title }) => {
  const append = <></>;

  return <TitleNode title={title} append={append} />;
};

export const getEmpty = (title) => {
  return [
    {
      className: 'gml-node gml-node-empty gml-node-select-none',
      title,
      key: 'empty' + title,
      selectable: false,
    },
  ];
};

export const getColumn = (columns: ModelColumnData[]): TreeNode[] => {
  return columns.map((column): TreeNode => {
    return {
      icon: <span title={column.type}>{getColumnTypeIcon(column.type)}</span>,
      className: 'gml-node gml-node-column gml-node-select-none',
      title: (
        <ColumnNode
          title={column.name}
          relationship={column?.relationship}
          primary={column.isPrimaryKey}
        />
      ),
      key: column.id,
      selectable: false,
      isLeaf: true,
    };
  });
};

export const getModel = (models: ModelData[]) => {
  return models.map((model): TreeNode => {
    return {
      className: 'gml-node gml-node-model',
      icon: <ModelIcon style={{ marginTop: -2 }} />,
      title: <ParentNode title={model.name} />,
      key: model.id,
      children: getColumn(model.columns),
    };
  });
};

export const getMetricColumn = (columns: ModelColumnData[]): TreeNode[] => {
  return columns.map((column): TreeNode => {
    return {
      icon: <span title={column.type}>{getColumnTypeIcon(column.type)}</span>,
      className: 'gml-node gml-node-column gml-node-select-none',
      title: <MetricColumnNode title={column.name} />,
      key: column.id,
      selectable: false,
      isLeaf: true,
    };
  });
};

export const getMetrics = (metrics) => {
  return metrics.map((metric) => {
    return {
      className: 'gml-node gml-node-model',
      icon: <MetricIcon style={{ marginTop: -2 }} />,
      title: <ParentNode title={metric.name} />,
      key: metric.id,
      children: getColumn(metric.columns),
    };
  });
};

export const getModelTreeData = (data): TreeNode[] => {
  const { models } = data;

  return [
    {
      className: 'gml-node-group',
      title: (
        <>
          Models <span className="gml-node-group-count">({models.length})</span>
        </>
      ),
      key: 'models',
      selectable: false,
      isLeaf: true,
    },
    ...(models.length ? getModel(models) : getEmpty('No Models')),
  ];
};

export const getMetricTreeData = (data): TreeNode[] => {
  const { metrics } = data;

  return [
    {
      className: 'gml-node-group',
      title: (
        <>
          Metrics{' '}
          <span className="gml-node-group-count">({metrics.length})</span>
        </>
      ),
      key: 'metrics',
      selectable: false,
      isLeaf: true,
    },
    ...(metrics.length ? getMetrics(metrics) : getEmpty('No Metrics')),
  ];
};
