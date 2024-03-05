import { useState } from 'react';
import copy from 'copy-to-clipboard';
import { message } from 'antd';
import { COLLAPSE_CONTENT_TYPE } from '@vulcan-sql/admin-ui/utils/enum';

export default function useAnswerStepContent() {
  const [collapseContentType, setCollapseContentType] =
    useState<COLLAPSE_CONTENT_TYPE>(COLLAPSE_CONTENT_TYPE.NONE);

  const onViewSQL = () =>
    setCollapseContentType(COLLAPSE_CONTENT_TYPE.VIEW_SQL);

  const onPreviewData = () =>
    setCollapseContentType(COLLAPSE_CONTENT_TYPE.PREVIEW_DATA);

  const onCloseCollapse = () =>
    setCollapseContentType(COLLAPSE_CONTENT_TYPE.NONE);

  const onCopyFullSQL = (sql: string) => {
    copy(sql);
    message.success('Copied SQL to clipboard.');
  };

  const isViewSQL = collapseContentType === COLLAPSE_CONTENT_TYPE.VIEW_SQL;

  const isPreviewData =
    collapseContentType === COLLAPSE_CONTENT_TYPE.PREVIEW_DATA;

  return {
    isPreviewData,
    isViewSQL,
    onCloseCollapse,
    onCopyFullSQL,
    onPreviewData,
    onViewSQL,
  };
}
