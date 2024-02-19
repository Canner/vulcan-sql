import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import copy from 'copy-to-clipboard';
import styled from 'styled-components';
import { Button, message } from 'antd';
import { DataNode } from 'antd/es/tree';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import SidebarTree, { useSidebarTreeState } from './SidebarTree';
import { createTreeGroupNode } from '@vulcan-sql/admin-ui/components/sidebar/utils';
import { Path } from '@vulcan-sql/admin-ui/utils/enum';
import ExplorationTreeTitle from '@vulcan-sql/admin-ui/components/sidebar/exploration/ExplorationTreeTitle';

// TODO: update it to real exploration data type
export interface ExplorationData {
  id: string;
  name: string;
}

interface Props {
  data: ExplorationData[];
  onSelect: (selectKeys) => void;
}

const ExplorationSidebarTree = styled(SidebarTree)`
  .adm-treeNode {
    &__button {
      padding: 0px 16px 0px 4px !important;

      button {
        background-color: transparent;
      }

      .ant-tree-title {
        width: 100%;
      }
    }

    &.adm-treeNode__exploration {
      padding: 0px 16px 0px 4px !important;

      .ant-tree-title {
        flex-grow: 1;
        display: inline-flex;
        align-items: center;
        span:first-child,
        .adm-treeTitle__title {
          flex-grow: 1;
        }
      }
    }
  }
`;

export default function Exploration(props: Props) {
  const { data, onSelect } = props;
  const router = useRouter();

  const getExplorationGroupNode = createTreeGroupNode({
    groupName: 'Exploration',
    groupKey: 'exploration',
    icons: [],
  });

  const [tree, setTree] = useState<DataNode[]>(getExplorationGroupNode());
  const { treeSelectedKeys, setTreeSelectedKeys } = useSidebarTreeState();

  useEffect(() => {
    router.query.id && setTreeSelectedKeys([router.query.id] as string[]);
  }, [router.query.id]);

  // initial workspace
  useEffect(() => {
    setTree((tree) =>
      getExplorationGroupNode({
        quotaUsage: data.length,
        children: [
          {
            className: 'adm-treeNode__button',
            id: 'add-exploration-result',
            isLeaf: true,
            selectable: false,
            key: 'add-exploration-result',
            title: (
              <Button onClick={() => router.push(Path.Explore)} block>
                <PlusOutlined />
                New exploration
              </Button>
            ),
          } as DataNode,
          ...data.map((exploration) => {
            const nodeKey = exploration.id;

            return {
              className: 'adm-treeNode adm-treeNode__exploration',
              id: nodeKey,
              isLeaf: true,
              key: nodeKey,
              title: (
                <ExplorationTreeTitle
                  explorationId={nodeKey}
                  title={exploration.name}
                  onCopyLink={onCopyLink}
                  onRename={(newExplorationName) => {
                    // TODO: Call API to rename the exploration result title
                    console.log(
                      'Call API to rename the exploration result title:',
                      newExplorationName
                    );
                  }}
                  onDelete={onDeleteExploration}
                />
              ),
            };
          }),
        ],
      })
    );
  }, [data]);

  const onDeleteExploration = (explorationId: string) => {
    // TODO: Call API to delete the exploration result
    console.log('Call delete API:', explorationId);
  };

  const onCopyLink = (explorationId: string) => {
    copy(`${window.location.toString()}/${explorationId}`);
    message.success('Copied link to clipboard!');
  };

  const onTreeSelect = (selectedKeys: React.Key[], info: any) => {
    setTreeSelectedKeys(selectedKeys);
    onSelect(selectedKeys);
  };

  return (
    <ExplorationSidebarTree
      treeData={tree}
      onSelect={onTreeSelect}
      selectedKeys={treeSelectedKeys}
    />
  );
}
