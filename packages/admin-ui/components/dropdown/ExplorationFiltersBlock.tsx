import { useEffect, useState } from 'react';
import { startCase } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { Space, Tag } from 'antd';
import { MetricData, ModelData } from '@vulcan-sql/admin-ui/utils/data/model';
import FilterDropdown, { OPTION_MODE } from './FilterDropdown';

export enum ECPLORATION_RESOURCE_TYPE {
  METRIC = 'metric',
  MODEL = 'model',
  VIEW = 'view',
}

enum COLOR_CLASS {
  CITRUS = 'adm-btn-citrus',
  GREEN = 'adm-btn-green',
  PURPLE = 'adm-btn-purple',
}

enum FILTER_KEY {
  CALCULATED_FIELDS = 'calculatedFields',
  DIMENSIONS = 'dimensions',
  FIELDS = 'fields',
  FILTERS = 'filters',
  MEASURES = 'measures',
  ORDER_BY = 'orderBy',
  LIMIT = 'limit',
}

const colorClass = {
  [FILTER_KEY.CALCULATED_FIELDS]: COLOR_CLASS.CITRUS,
  [FILTER_KEY.DIMENSIONS]: COLOR_CLASS.GREEN,
  [FILTER_KEY.FIELDS]: COLOR_CLASS.GREEN,
  [FILTER_KEY.FILTERS]: COLOR_CLASS.PURPLE,
  [FILTER_KEY.MEASURES]: COLOR_CLASS.CITRUS,
};

const OptionType = {
  [FILTER_KEY.CALCULATED_FIELDS]: OPTION_MODE.MULTIPLE,
  [FILTER_KEY.DIMENSIONS]: OPTION_MODE.MULTIPLE,
  [FILTER_KEY.FIELDS]: OPTION_MODE.MULTIPLE,
  [FILTER_KEY.FILTERS]: OPTION_MODE.SINGLE,
  [FILTER_KEY.MEASURES]: OPTION_MODE.MULTIPLE,
  [FILTER_KEY.ORDER_BY]: OPTION_MODE.MULTIPLE,
  [FILTER_KEY.LIMIT]: OPTION_MODE.SINGLE,
};

// TODO: Add real View data Type
type ViewData = {
  fields: any[];
};

interface Props {
  data: ModelData | MetricData | ViewData;
  onFiltersChange: (filterType: FILTER_KEY, value) => void;
  selectedType: ECPLORATION_RESOURCE_TYPE;
}

export default function ExplorationFiltersBlock(props: Props) {
  const { data = {}, onFiltersChange, selectedType } = props;

  const fieldsDropdown = useFilterDropdown(FILTER_KEY.FIELDS, onFiltersChange);
  const calculatedFieldsDropdown = useFilterDropdown(
    FILTER_KEY.CALCULATED_FIELDS,
    onFiltersChange
  );
  const dimensionsDropdown = useFilterDropdown(
    FILTER_KEY.DIMENSIONS,
    onFiltersChange
  );
  const measuresDropdown = useFilterDropdown(
    FILTER_KEY.MEASURES,
    onFiltersChange
  );
  const filtersDropdown = useFilterDropdown(
    FILTER_KEY.FILTERS,
    onFiltersChange
  );

  useEffect(() => {
    // TODO
    switch (selectedType) {
      case ECPLORATION_RESOURCE_TYPE.MODEL: {
        const { fields = [], calculatedFields = [] } = data as ModelData;
        fieldsDropdown.onSetOptions(fields);

        calculatedFieldsDropdown.onSetOptions(calculatedFields);

        filtersDropdown.onSetOptions([...fields, ...calculatedFields]);

        break;
      }

      case ECPLORATION_RESOURCE_TYPE.METRIC: {
        const {
          measures = [],
          dimensions = [],
          timeGrains = [],
        } = data as MetricData;
        measuresDropdown.onSetOptions(measures);

        dimensionsDropdown.onSetOptions([...dimensions, ...timeGrains]);

        filtersDropdown.onSetOptions([
          ...measures,
          ...dimensions,
          ...timeGrains,
        ]);
        break;
      }

      case ECPLORATION_RESOURCE_TYPE.VIEW: {
        const { fields = [] } = data as ViewData;
        fieldsDropdown.onSetOptions(fields);
        filtersDropdown.onSetOptions(fields);
        break;
      }
    }
  }, [data, selectedType]);

  const filterDropdowns =
    selectedType === ECPLORATION_RESOURCE_TYPE.MODEL
      ? [fieldsDropdown, calculatedFieldsDropdown, filtersDropdown]
      : selectedType === ECPLORATION_RESOURCE_TYPE.METRIC
      ? [dimensionsDropdown, measuresDropdown, filtersDropdown]
      : [fieldsDropdown, filtersDropdown];

  const onRemoveTag = (_filterItem, index: number) => {
    filtersDropdown.onChange(
      filtersDropdown.value.filter((_, idx) => idx !== index)
    );
  };

  return (
    <>
      <Space>
        {filterDropdowns.map((props) => (
          <FilterDropdown key={props.key} {...props} />
        ))}
      </Space>
      {filtersDropdown.value.length > 0 && (
        <div className="mt-4">
          <Space size={[2, 8]} wrap>
            {filtersDropdown.value.map((filterItem, index) => (
              <Tag
                key={`${filterItem.key}-${index}-${uuidv4()}`}
                className="adm-tag-purple text-truncate"
                closable
                onClose={() => {
                  onRemoveTag(filterItem, index);
                }}
              >
                {filterItem.label}
              </Tag>
            ))}
          </Space>
        </div>
      )}
    </>
  );
}

function useFilterDropdown(
  key: FILTER_KEY,
  callBack: (filterType, value) => void
) {
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);

  const optionMode = OptionType[key];

  const onCloseChange = () => setVisible(false);

  const onOpenChange = (open: boolean) => setVisible(open);

  const onReset = () => onChange([]);

  const onChange = (value) => {
    setSelectedOptions(value);
    callBack(key, value);
  };

  const convertToOptionsByModed = (mode, sourceData) => {
    return {
      [OPTION_MODE.SINGLE]: (data) => {
        return data.map((field) => {
          return {
            'data-option': field,
            id: field.id,
            key: field.id,
            label: field?.properties?.displayName || field.name,
          };
        });
      },
      [OPTION_MODE.MULTIPLE]: (data) => {
        return data.map((field) => {
          return {
            id: field.id,
            key: field.id,
            title: field?.properties?.displayName || field.name,
          };
        });
      },
    }[mode](sourceData);
  };

  const onSetOptions = (options) => {
    setOptions(convertToOptionsByModed(optionMode, options));
  };

  return {
    colorClass: colorClass[key] || '',
    disabled: false,
    key,
    onChange,
    onCloseChange,
    onOpenChange,
    onReset,
    onSetOptions,
    options,
    title: startCase(key),
    value: selectedOptions,
    visible,
    optionMode,
  };
}
