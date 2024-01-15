import Link from 'next/link';
import { Button, Typography } from 'antd';
import { DATA_SOURCES } from '@vulcan-sql/admin-ui/utils/enum/dataSources';

export default function Starter(props) {
  const { onNext } = props;
  const onClick = () => {
    onNext && onNext({ dataSource: DATA_SOURCES.BIG_QUERY });
  };

  return (
    <>
      <Typography.Title level={1} className="mb-3">
        Connect the data source
      </Typography.Title>
      <Typography.Text>
        We only support BigQuery for now. You can vote for your warehouse in our{' '}
        <Link
          href="https://github.com/Canner/vulcan-sql/issues"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub issues
        </Link>
        !
      </Typography.Text>
      <div className="mt-6">
        <Button type="primary" onClick={onClick}>
          BigQuery
        </Button>
      </div>
    </>
  );
}
