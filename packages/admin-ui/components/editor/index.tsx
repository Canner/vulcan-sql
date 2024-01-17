import { forwardRef, useEffect, useRef } from 'react';
import AceEditor from '@vulcan-sql/admin-ui/components/editor/AceEditor';

export interface SQLEditorAutoCompleteSourceWordInfo {
  // Show main string
  caption: string;
  // insert string into editor
  value: string;
  // Show hint type string
  meta: string;
}

interface Props {
  autoCompleteSource: SQLEditorAutoCompleteSourceWordInfo[];
  onChange?: (value: any | null) => void;
}

function SQLEditor(props: Props, ref: any) {
  const { autoCompleteSource } = props;

  const editorRef = useRef<any>();

  useEffect(() => {
    const getCompletions = (editor, _session, _pos, _prefix, callback) => {
      const popup = editor.completer.popup;
      if (popup?.container) {
        popup.container.style.width = '50%';
        popup.resize();
      }

      callback(null, autoCompleteSource);
    };

    const { ace } = window as any;
    ace.require('ace/ext/language_tools').addCompleter({ getCompletions });

    return () => editorRef.current?.editor?.completers?.pop();
  }, [autoCompleteSource]);

  function onTriggerChange(changedValue: any) {
    props.onChange && props.onChange(changedValue);
  }

  return (
    <div ref={ref}>
      <AceEditor
        editorProps={{ $blockScrolling: true }}
        enableBasicAutocompletion
        enableLiveAutocompletion
        fontSize={14}
        height="300px"
        mode="sql"
        name="sql_editor"
        onChange={onTriggerChange}
        ref={editorRef}
        showPrintMargin={false}
        theme="tomorrow"
        width="100%"
      />
    </div>
  );
}

export default forwardRef(SQLEditor);
