import SimpleLayout from '@vulcan-sql/admin-ui/components/layouts/SimpleLayout';
import { useHelloQuery } from '@vulcan-sql/admin-ui/apollo/client/graphql/hello.generated';

export default function SetupConnection() {
  const { data } = useHelloQuery()
  return <SimpleLayout>Connection: {data?.hello}</SimpleLayout>;
}