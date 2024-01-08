import {
  ForwardedRef,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  ControlButton,
  useNodesState,
  useEdgesState,
  Edge,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow';
import { ModelNode, MetricNode } from './customNode/index';
import { ModelEdge, MetricEdge } from './customEdge/index';
import Marker from './Marker';
import { DiagramCreator } from '../../utils/diagram/creator';
import { wait } from '../../utils/time';
import { Refresh } from '@styled-icons/material-outlined';
import { EDGE_TYPE, NODE_TYPE, PayloadData } from './types';
import { trimId, highlightNodes, highlightEdges } from './utils';
import { DiagramContext } from './Context';

import 'reactflow/dist/style.css';

const nodeTypes = {
  [NODE_TYPE.MODEL]: ModelNode,
  [NODE_TYPE.METRIC]: MetricNode,
};
const edgeTypes = {
  [EDGE_TYPE.MODEL]: ModelEdge,
  [EDGE_TYPE.METRIC]: MetricEdge,
};
const minimapStyle = {
  height: 120,
};

interface Props {
  forwardRef?: ForwardedRef<unknown>;
  data: PayloadData;
  onInfoIconClick: (data: any) => void;
}

const ReactFlowDiagram = forwardRef(function ReactFlowDiagram(
  props: Props,
  ref
) {
  const { data, onInfoIconClick } = props;
  const [forceRender, setForceRender] = useState(false);
  const reactFlowInstance = useReactFlow();
  useImperativeHandle(ref, () => reactFlowInstance, [reactFlowInstance]);

  const diagram = useMemo(() => {
    return new DiagramCreator(data).toJsonObject();
  }, [data]);

  useEffect(() => {
    setNodes(diagram.nodes);
    setEdges(diagram.edges);

    wait(50).then(() => reactFlowInstance.fitView());
  }, [diagram]);

  const [nodes, setNodes, onNodesChange] = useNodesState(diagram.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(diagram.edges);

  // const { openInfoModal, closeInfoModal, infoModalProps } = useInfoModal();

  const onEdgeMouseEnter = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      setEdges(highlightEdges([edge.id], true));
      setNodes(
        highlightNodes(
          [edge.source, edge.target],
          [
            trimId(edge.sourceHandle as string),
            trimId(edge.targetHandle as string),
          ]
        )
      );
    },
    []
  );

  const onEdgeMouseLeave = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      setEdges(highlightEdges([], false));
      setNodes(highlightNodes([], []));
    },
    []
  );

  const onRestore = async () => {
    setNodes(diagram.nodes);
    setEdges(diagram.edges);
  };

  const onInit = async () => {
    await wait();
    reactFlowInstance.fitView();
    await wait(100);
    setForceRender(!forceRender);
  };

  return (
    <>
      <DiagramContext.Provider value={{ onInfoIconClick }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onEdgeMouseEnter={onEdgeMouseEnter}
          onEdgeMouseLeave={onEdgeMouseLeave}
          onInit={onInit}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          maxZoom={1}
          proOptions={{ hideAttribution: true }}
        >
          <MiniMap style={minimapStyle} zoomable pannable />
          <Controls showInteractive={false}>
            <ControlButton onClick={onRestore}>
              <Refresh style={{ maxWidth: 24, maxHeight: 24 }} />
            </ControlButton>
          </Controls>
        </ReactFlow>
      </DiagramContext.Provider>

      <Marker />
    </>
  );
});

export const Diagram = (props: Props) => {
  return (
    <ReactFlowProvider>
      <ReactFlowDiagram ref={props.forwardRef} {...props} />
    </ReactFlowProvider>
  );
};

export default Diagram;
