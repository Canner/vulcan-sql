import styled from 'styled-components';

const StyledNode = styled.span`
  flex-grow: 1;
  display: flex;
  justify-content: space-between;
  min-width: 1px;

  > *:first-child {
    flex: 1 1 100%;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    min-width: 1px;
  }
  > *:last-child {
    flex: 0 0 auto;
  }
`;

interface Props {
  title: string;
  append?: React.ReactNode;
}

export function TitleNode({ title, append }: Props) {
  return (
    <StyledNode>
      <span>{title}</span> {append}
    </StyledNode>
  );
}
