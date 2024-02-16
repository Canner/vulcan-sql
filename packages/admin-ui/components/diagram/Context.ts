import { createContext } from 'react';
import { ModelData, MetricData } from '@vulcan-sql/admin-ui/utils/data';

export interface ClickPayload {
  [key: string]: any;
  title: string;
  data: ModelData | MetricData;
}

type ContextProps = {
  onMoreClick: (data: ClickPayload) => void;
  onNodeClick: (data: ClickPayload) => void;
} | null;

export const DiagramContext = createContext<ContextProps>({
  onMoreClick: () => {},
  onNodeClick: () => {},
});
