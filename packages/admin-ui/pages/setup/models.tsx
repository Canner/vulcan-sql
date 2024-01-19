import { useMemo } from 'react';
import SimpleLayout from '@vulcan-sql/admin-ui/components/layouts/SimpleLayout';
import ContainerCard from '@vulcan-sql/admin-ui/components/pages/setup/ContainerCard';
import useSetupModels from '@vulcan-sql/admin-ui/hooks/useSetupModels';
import { SETUP_STEPS } from '@vulcan-sql/admin-ui/components/pages/setup/utils';

export default function SetupModels() {
  const { stepKey, onNext, onBack } = useSetupModels();

  const current = useMemo(() => SETUP_STEPS[stepKey], [stepKey]);

  return <SimpleLayout>
  <ContainerCard step={current.step} maxWidth={current.maxWidth}>
    <current.component
      onNext={onNext}
      onBack={onBack}
    />
  </ContainerCard>
</SimpleLayout>
}
