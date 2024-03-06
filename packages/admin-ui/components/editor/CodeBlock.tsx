import { Typography } from 'antd';
import { useEffect } from 'react';
import styled from 'styled-components';

const Block = styled.div<{ inline?: boolean }>`
  position: relative;
  white-space: pre;
  ${(props) =>
    props.inline
      ? `display: inline; border: none; background: transparent !important; padding: 0;`
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
  code: string;
  inline?: boolean;
  copyable?: boolean;
}

const addThemeStyleManually = (cssText) => {
  // same id as ace editor appended, it will exist only one.
  const id = 'ace-tomorrow';
  const themeElement = document.getElementById(id);
  if (!themeElement) {
    const styleElement = document.createElement('style');
    styleElement.id = id;
    document.head.appendChild(styleElement);
    styleElement.appendChild(document.createTextNode(cssText));
  }
};

export default function CodeBlock(props: Props) {
  const { code, inline, copyable } = props;
  const { ace } = window as any;
  const { Tokenizer } = ace.require('ace/tokenizer');
  const { SqlHighlightRules } = ace.require(`ace/mode/sql_highlight_rules`);
  const rules = new SqlHighlightRules();
  const tokenizer = new Tokenizer(rules.getRules());

  useEffect(() => {
    const { cssText } = ace.require('ace/theme/tomorrow');
    addThemeStyleManually(cssText);
  }, []);

  const lines = code.split('\n').map((line) => {
    const tokens = tokenizer.getLineTokens(line).tokens;
    const children = tokens.map((token, index) => {
      const classNames = token.type.split('.').map((name) => `ace_${name}`);
      return (
        <span key={index} className={classNames.join(' ')}>
          {token.value}
        </span>
      );
    });
    return (
      <span className="ace_line" key={line}>
        {children}
      </span>
    );
  });

  return (
    <Block className="ace_editor ace-tomorrow" inline={inline}>
      {lines}
      {copyable && <CopyText copyable>{code}</CopyText>}
    </Block>
  );
}
