import { useRouter } from 'next/router';
import { Path } from '@vulcan-sql/admin-ui/utils/enum';
import SiderLayout from '@vulcan-sql/admin-ui/components/layouts/SiderLayout';
import Prompt from '@vulcan-sql/admin-ui/components/pages/home/Prompt';

export default function Ask() {
  const router = useRouter();
  const data = [];

  const onSelect = (selectKeys: string[]) => {
    router.push(`${Path.ASK}/${selectKeys[0]}`);
  };

  return (
    <SiderLayout loading={false} sidebar={{ data, onSelect }}>
      <Prompt />
    </SiderLayout>
  );
}
