import { Modal, ModalProps, Typography } from 'antd';
import styled from 'styled-components';
import Image from 'next/image';
import Link from 'next/link';

const { Paragraph } = Typography;

const StyledTutorialModal = styled(Modal)`
  .tutorialModal {
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

  img {
    margin-top: 10px !important;
  }
`;

type TutorialModalProps = ModalProps & {
  type: TutorialType;
  codeContent: string;
};

export enum TutorialType {
  EXCEL = 'excel',
  GOOGLE_SPREADSHEET = 'googleSpreadsheet',
  ZAPIER = 'zapier',
  RETOOL = 'retool',
}

export default function TutorialModal(props: TutorialModalProps) {
  const tutorial = getTutorial(props);
  if (!tutorial) {
    return <></>;
  }

  return (
    <StyledTutorialModal title={tutorial.title} width={700} {...props}>
      {tutorial.steps.map((step, index) => (
        <div key={index} className="tutorialModal-step">
          {step}
        </div>
      ))}
    </StyledTutorialModal>
  );
}

function getTutorial(props) {
  const template = {
    [TutorialType.EXCEL]: {
      title: 'Connect From Excel',
      steps: [
        <>
          Step 1: Copy Code
          <Paragraph
            style={{ marginTop: 8 }}
            className="tutorialModal-code"
            code
            copyable
          >
            {props.codeContent}
          </Paragraph>
        </>,
        <>Step 2: Open Excel</>,
        <>
          Step 3: In Excel, select Data {'>'} Get & Transform {'>'} From Web.
          <Image src="/excel-step3.png" width="650" height="327" alt="excel" />
        </>,
        <>
          Step 4: Paste the Url and select OK
          <Image src="/excel-step4.png" width="650" height="327" alt="excel" />
        </>,
        <>
          Step 5: In the Navigator pane, under Display Options, select the
          Results table. Power Query will preview it for you in the Table View
          pane on the right.
          <Image src="/excel-step5.png" width="650" height="365" alt="excel" />
        </>,
        <>
          Step 6: Select Load. Power Query transforms the data and loads it as
          an Excel table.
        </>,
      ],
    },
    [TutorialType.GOOGLE_SPREADSHEET]: {
      title: 'Connect From Google Spreadsheet',
      steps: [
        <>
          Step 1: Copy Code
          <Paragraph
            style={{ marginTop: 8 }}
            className="tutorialModal-code"
            code
            copyable
          >
            {props.codeContent}
          </Paragraph>
        </>,
        <>Step 2: Open Google Spreadsheet</>,
        <>
          Step 3: Import data to Google Spreadsheet
          <Image
            src="/googleSpreadsheet-step3.jpg"
            width="650"
            height="278"
            alt="google spreadsheet"
          />
        </>,
      ],
    },
    [TutorialType.ZAPIER]: {
      title: 'Connect From Zapier',
      steps: [
        <>
          Step 1: Copy Code
          <Paragraph
            style={{ marginTop: 8 }}
            className="tutorialModal-code"
            code
            copyable
          >
            {props.codeContent}
          </Paragraph>
        </>,
        <>
          Step 2: Use it in{' '}
          <Link href="https://zapier.com/apps/webhook/integrations#triggers-and-actions">
            <a target="_blank">Zapier Webhook Integration</a>
          </Link>
          <Image
            src="/zapier-step2.jpg"
            width="650"
            height="362"
            alt="zapier"
          />
        </>,
      ],
    },
    [TutorialType.RETOOL]: {
      title: 'Connect From Retool',
      steps: [
        <>
          Step 1: Copy Code
          <Paragraph
            style={{ marginTop: 8 }}
            className="tutorialModal-code"
            code
            copyable
          >
            {props.codeContent}
          </Paragraph>
        </>,
        <>
          Step 2: Connect to API from{' '}
          <Link href="https://docs.retool.com/docs/connect-api-resource">
            <a target="_blank">Retool</a>
          </Link>
          <Image
            src="/retool-step2.jpg?v=1"
            width="650"
            height="340"
            alt="retool"
          />
        </>,
      ],
    },
  };
  return template[props.type] || null;
}
