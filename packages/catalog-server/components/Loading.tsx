import LoadingOutlined from '@ant-design/icons/LoadingOutlined';
import { Spin } from 'antd';

export default function Loading() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 140,
      }}
    >
      <Spin
        size="large"
        indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
      />
    </div>
  );
}
