import { Modal, ModalProps, Typography } from 'antd';
import styled from 'styled-components';
import Image from 'next/image';

const { Paragraph } = Typography;

const StyledGoogleSpreadsheetModal = styled(Modal)`
  .googleSpreadsheetModal {
    &-step {
      color: #000;
      margin-bottom: 8px;
    }
    &-code {
      position: relative;
      > code {
        font-family: inherit;
        font-size: 14px;
        margin: 0;
        padding: 8px 16px;
        display: block;
        white-space: pre-wrap;
        padding-right: 30px;
        color: #000;
        border: none;
      }

      .ant-typography-copy {
        position: absolute;
        top: 4px;
        right: 10px;
      }
    }
  }
`;

type GoogleSpreadsheetModalProps = ModalProps & {
  codeContent: string;
};

export default function GoogleSpreadsheetModal(
  props: GoogleSpreadsheetModalProps
) {
  const {
    codeContent = 'https://api.canner.co/v0/pipes/untitled_pipe_8974.json?token=p.eyJ1IjogIjgyM2Q3ZDNjLWNjNWItNGY2YS04N2E5LWI0YzAxZDA3YTllZCIsICJpZCI6ICI2NmM1MmU2Ni02ZTQwLTQ4N2UtOGEwNC1iZGMzMGJiMDJhMzYifQ.HB-M8Lo09eeGnridyuuRD82okTI9BboWlFGsARJcDt4',
  } = props;
  return (
    <StyledGoogleSpreadsheetModal
      title="Connect From Google Spreadsheet "
      width={700}
      {...props}
    >
      <div className="googleSpreadsheetModal-step">
        Step 1: Copy Code
        <Paragraph
          style={{ marginTop: 8 }}
          className="googleSpreadsheetModal-code"
          code
          copyable
        >
          {codeContent}
        </Paragraph>
      </div>
      <div className="googleSpreadsheetModal-step">
        Step 2: Open Google Spreadsheet
      </div>
      <div className="googleSpreadsheetModal-step">
        Step 3: Import Data to Google Spreadsheet
        <Image
          style={{ marginTop: 10 }}
          src="/googleSpreadsheet-step3.jpg"
          width="650"
          height="278"
          alt="google spreadsheet"
        />
      </div>
    </StyledGoogleSpreadsheetModal>
  );
}
