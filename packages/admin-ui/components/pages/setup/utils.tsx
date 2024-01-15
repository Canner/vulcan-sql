import Starter from './Starter';
import ConnectDataSource from './ConnectDataSource';
import CreateModels from './CreateModels';
import DefineRelations from './DefineRelations';
import { SETUP, DATA_SOURCES } from '@vulcan-sql/admin-ui/utils/enum';
import BigQueryProperties from './dataSources/BigQueryProperties';

type SetupStep = {
  step: number;
  component: (
    props?: React.ComponentProps<typeof Starter> &
      React.ComponentProps<typeof ConnectDataSource> &
      React.ComponentProps<typeof CreateModels> &
      React.ComponentProps<typeof DefineRelations>
  ) => JSX.Element;
  maxWidth?: number;
};

export const SETUP_STEPS = {
  [SETUP.STARTER]: {
    step: 0,
    component: Starter,
  },
  [SETUP.CREATE_DATA_SOURCE]: {
    step: 0,
    component: ConnectDataSource,
    maxWidth: 800,
  },
  [SETUP.CREATE_MODELS]: {
    step: 1,
    component: CreateModels,
  },
  [SETUP.DEFINE_RELATIONS]: {
    step: 2,
    component: DefineRelations,
  },
} as { [key: string]: SetupStep };

export const DATA_SOURCE_OPTIONS = {
  [DATA_SOURCES.BIG_QUERY]: {
    label: 'BigQuery',
    logo: '/images/dataSource/bigquery.svg',
    component: BigQueryProperties,
  },
};

export const getDataSource = (dataSource: DATA_SOURCES) => {
  const defaultDataSource = DATA_SOURCE_OPTIONS[DATA_SOURCES.BIG_QUERY];
  return ({
    [DATA_SOURCES.BIG_QUERY]: defaultDataSource,
  }[dataSource] || defaultDataSource) as typeof defaultDataSource;
};
