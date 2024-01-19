import { useState } from 'react';
import { DATA_SOURCES, SETUP } from '@vulcan-sql/admin-ui/utils/enum';
import { useRouter } from 'next/router';

export default function useSetupConnection() {
  const [stepKey] = useState(SETUP.CREATE_MODELS);
  const router = useRouter();

  const onBack = () => {
    router.push('/setup/connection');
  };

  const onNext = (data?: { dataSource: DATA_SOURCES }) => {
    router.push('/setup/relations');
  };

  return {
    stepKey,
    onBack,
    onNext,
  };
}
