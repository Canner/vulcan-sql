import { Typography } from 'antd';
import styled from 'styled-components';

const Block = styled.div<{ inline?: boolean }>`
  position: relative;
  white-space: pre;
  ${(props) =>
    props.inline
      ? `border: none; background: transparent; padding: 0;`
      : `background: var(--gray-3); padding: 8px 24px 8px 8px;`}
`;

const CopyText = styled(Typography.Text)`
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 0;
  .ant-typography-copy {
    font-size: 12px;
  }
`;

interface Props {
  copyable?: boolean;
  inline?: boolean;
  code: string;
}

export default function CodeBlock(props: Props) {
  const { code, copyable, inline } = props;
  const { ace } = window as any;
  const { Tokenizer } = ace.require('ace/tokenizer');
  const { SqlHighlightRules } = ace.require(`ace/mode/sql_highlight_rules`);
  const rules = new SqlHighlightRules();
  const tokenizer = new Tokenizer(rules.getRules());

  const lines = code.split('\n').map((line) => {
    const tokens = tokenizer.getLineTokens(line).tokens;
    console.log(tokens);
    const children = tokens.map((token, index) => {
      const classNames = token.type.split('.').map((name) => `ace_${name}`);
      return (
        <span key={index} className={classNames.join(' ')}>
          {token.value}
        </span>
      );
    });
    return (
      <div className="ace_line" key={line}>
        {children}
      </div>
    );
  });

  return (
    <Block className="ace_editor ace-tomorrow" inline={inline}>
      {lines}
      {copyable && <CopyText copyable>{code}</CopyText>}
    </Block>
  );
}
