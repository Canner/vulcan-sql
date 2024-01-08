import { createContext } from 'react';

type ContextProps = {
  onInfoIconClick: (data: any) => void;
} | null;

export const DiagramContext = createContext<ContextProps>(null);
