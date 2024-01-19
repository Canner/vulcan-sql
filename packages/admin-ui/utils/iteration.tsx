interface Props {
  [key: string]: any;
  data: any[];
  // by default it will use item['key'] as keyIndex unless specifying keyIndex
  keyIndex?: (item: any) => string | string;
}

// eslint-disable-next-line react/display-name
export const makeIterable = (Template: React.FC) => (props: Props) => {
  const { data, keyIndex = 'key', ...restProps } = props;
  const result = data.map((item, index) => {
    const key =
      typeof keyIndex === 'function' ? keyIndex(item) : item[keyIndex];
    return (
      <Template data={item} key={`${index}-${key}`} {...restProps} {...item} />
    );
  });
  return <>{result}</>;
};
