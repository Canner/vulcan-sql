import { Space } from 'antd'
import Image from "next/image";

export default function LogoBar() {
  return <Space>
    <Image src="/logo.svg" alt="Logo" width={40} height={40} />
    <span className="gray-8">VulcanSQL</span>
  </Space>;
}