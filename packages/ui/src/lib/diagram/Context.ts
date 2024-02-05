import { createContext } from 'react';

type ContextProps = {
  onMoreClick: (data: any) => void;
} | null;

export const DiagramContext = createContext<ContextProps>(null);
