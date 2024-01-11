import SiderLayout from '@vulcan-sql/admin-ui/components/layouts/SiderLayout';

export default function Explore() {
  return (
    <SiderLayout
      sidebar={{
        // TODO: adjust sidebar component
        data: { models: [], metrics: [] },
        onSelect: () => {},
      }}
    >
      Explore
    </SiderLayout>
  );
}
