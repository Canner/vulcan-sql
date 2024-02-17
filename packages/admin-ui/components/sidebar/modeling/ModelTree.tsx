import { useEffect, useState } from 'react';
import { DataNode } from 'antd/es/tree';
import { startCase } from 'lodash';
import PlusSquareOutlined from '@ant-design/icons/PlusSquareOutlined';
import { getNodeTypeIcon } from '@vulcan-sql/admin-ui/utils/nodeType';
import {
  createTreeGroupNode,
  getColumnNode,
} from '@vulcan-sql/admin-ui/components/sidebar/utils';
import LabelTitle from '@vulcan-sql/admin-ui/components/sidebar/modeling/LabelTitle';
import { NODE_TYPE } from '@vulcan-sql/admin-ui/utils/enum';
import { StyledSidebarTree } from '@vulcan-sql/admin-ui/components/sidebar/Modeling';

export default function ModelTree(props) {
  const { onOpenModelDrawer, models } = props;

  const getModelGroupNode = createTreeGroupNode({
    groupName: 'Models',
    groupKey: 'models',
    icons: [
      {
        key: 'add-model',
        icon: () => <PlusSquareOutlined onClick={() => onOpenModelDrawer()} />,
      },
    ],
  });

  const [tree, setTree] = useState<DataNode[]>(getModelGroupNode());

  // initial workspace
  useEffect(() => {
    setTree((tree) =>
      getModelGroupNode({
        quotaUsage: models.length,
        children: models.map((model) => {
          const nodeKey = model.id;

          const children = [
            ...getColumnNode(nodeKey, [
              ...model.fields,
              ...model.calculatedFields,
            ]),
            ...getColumnNode(
              nodeKey,
              model.relationFields,
              startCase(NODE_TYPE.RELATION)
            ),
          ];

          return {
            children,
            className: 'adm-treeNode',
            icon: getNodeTypeIcon({ nodeType: model.nodeType }),
            id: nodeKey,
            isLeaf: false,
            key: nodeKey,
            title: <LabelTitle title={model.name} />,
            type: model.nodeType,
          };
        }),
      })
    );
  }, [models]);

  return <StyledSidebarTree {...props} treeData={tree} />;
}
