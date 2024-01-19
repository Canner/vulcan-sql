import { useRef } from 'react';
import styled from 'styled-components';
import FieldSelect, { FieldValue, FieldOption } from './FieldSelect';
import { nextTick } from '@vulcan-sql/admin-ui/utils/time';
import { makeIterable } from '@vulcan-sql/admin-ui/utils/iteration';
import { NODE_TYPE } from '@vulcan-sql/admin-ui/utils/enum';

interface Props {
  model: string;
  options: FieldOption[];
  onChange?: (value: FieldValue[]) => void;
  value?: FieldValue[];
}

const Wrapper = styled.div`
  border: 1px var(--gray-5) solid;
  border-radius: 4px;
  overflow-x: auto;
`;

const SelectResult = makeIterable(FieldSelect);

export default function RelationsSelector(props: Props) {
  const wrapper = useRef<HTMLDivElement | null>(null);
  const { model, value = [], onChange, options } = props;

  const initialData = [{ name: model, nodeType: NODE_TYPE.MODEL }];
  const data = initialData.concat(value);

  const change = async (selectValue, index) => {
    const parsePayload = JSON.parse(selectValue);

    const prevValue = value.slice(0, index);
    const nextValue = [...prevValue, parsePayload];
    onChange && onChange(nextValue);

    await nextTick();
    wrapper.current?.scrollTo({ left: wrapper.current?.scrollWidth });
  };

  return (
    <Wrapper ref={wrapper} className="d-flex align-center bg-gray-3 p-8">
      <SelectResult data={data} options={options} onChange={change} />
    </Wrapper>
  );
}
