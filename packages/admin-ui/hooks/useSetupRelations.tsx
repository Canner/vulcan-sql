import { useState } from 'react';
import { DATA_SOURCES, SETUP } from '@vulcan-sql/admin-ui/utils/enum';
import { useRouter } from 'next/router';

export default function useSetupConnection() {
  const [stepKey, setStepKey] = useState(SETUP.RECOMMEND_RELATIONS);
  const router = useRouter();

  const onBack = () => {
    if (stepKey === SETUP.DEFINE_RELATIONS) {
      setStepKey(SETUP.RECOMMEND_RELATIONS);
    } else {
      router.push('/setup/models');
    }
  };

  const onNext = (data?: { dataSource: DATA_SOURCES }) => {
    setStepKey(SETUP.DEFINE_RELATIONS);
  };

  return {
    stepKey,
    onBack,
    onNext,
  };
}
