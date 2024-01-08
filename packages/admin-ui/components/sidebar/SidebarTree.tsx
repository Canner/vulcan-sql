import { useState } from 'react';
import styled, { css } from 'styled-components';
import { Tree, TreeProps } from 'antd';

const anticonStyle = css`
  [class^='anticon anticon-'] {
    transition: background-color ease-out 0.12s;
    border-radius: 2px;
    width: 12px;
    height: 12px;
    font-size: 12px;
    vertical-align: middle;

    &:hover {
      background-color: var(--gray-5);
    }
    &:active {
      background-color: var(--gray-6);
    }

    &[disabled] {
      cursor: not-allowed;
      color: var(--gray-6);
      &:hover,
      &:active {
        background-color: transparent;
      }
    }
  }
  .anticon + .anticon {
    margin-left: 4px;
  }
`;

const StyledTree = styled(Tree)`
  &.ant-tree {
    background-color: transparent;
    color: var(--gray-8);

    .ant-tree-indent-unit {
      width: 12px;
    }

    .ant-tree-node-content-wrapper {
      display: flex;
      align-items: center;
      line-height: 18px;
      min-height: 28px;
      min-width: 1px;
      padding: 0;
    }

    .ant-tree-node-content-wrapper:hover,
    .ant-tree-node-content-wrapper.ant-tree-node-selected {
      background-color: transparent;
    }

    .ant-tree-treenode {
      padding: 0 16px;
      background-color: transparent;
      transition: background-color ease-out 0.12s;

      &-selected {
        color: var(--geekblue-6);
        background-color: var(--gray-4);
      }

      .ant-tree-switcher {
        width: 12px;
        align-self: center;
        .ant-tree-switcher-icon {
          font-size: 12px;
          vertical-align: middle;
        }
        ${anticonStyle}
      }

      .ant-tree-iconEle {
        flex-shrink: 0;
      }
    }

    .gml {
      &-node {
        &:hover {
          background-color: var(--gray-4);
        }
        &:active {
          background-color: var(--gray-6);
        }
        .ant-tree-title {
          display: inline-flex;
          flex-wrap: nowrap;
          flex-grow: 1;
          min-width: 1px;
        }

        &-group {
          color: var(--gray-7);
          margin-top: 16px;
          .ant-tree-switcher-noop {
            display: none;
          }
          > * {
            cursor: inherit;
          }

          &-count {
            position: relative;
            top: -1px;
            font-size: 10px;
          }
        }

        &-empty {
          color: var(--gray-7);
          font-size: 12px;
          .ant-tree-switcher {
            display: none;
          }
          .ant-tree-node-content-wrapper {
            min-height: auto;
          }
        }

        &-select-none {
          * {
            cursor: auto;
          }
          &:hover,
          &:active {
            background-color: transparent;
          }
        }
      }
    }
  }
`;

export const useSidebarTreeState = () => {
  const [treeSelectedKeys, setTreeSelectedKeys] = useState<React.Key[]>([]);
  const [treeExpandKeys, setTreeExpandKeys] = useState<React.Key[]>([]);
  const [treeLoadedKeys, setTreeLoadedKeys] = useState<React.Key[]>([]);
  const [autoExpandParent, setAutoExpandParent] = useState(true);

  return {
    treeSelectedKeys,
    treeExpandKeys,
    treeLoadedKeys,
    autoExpandParent,
    setTreeSelectedKeys,
    setTreeExpandKeys,
    setTreeLoadedKeys,
    setAutoExpandParent,
  };
};

export default function SidebarTree(props: TreeProps) {
  return (
    <StyledTree
      blockNode
      showIcon
      motion={null} // https://github.com/ant-design/ant-design/issues/16943#issuecomment-859966751
      {...props}
    />
  );
}
