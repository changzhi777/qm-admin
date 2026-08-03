/**
 * 设备数据源 — V0.3.35 sprint B
 *
 * admin.listDeviceSources：DeviceBinding + DeviceDailyActivity 最近 7 天聚合
 * 用于排查「为什么某用户数据没传上来」「哪些设备长期未同步」
 */
import { App as AntdApp, Tag, Statistic, Row, Col, Space } from 'antd';
import { PageContainer, ProTable, type ProColumns } from '@ant-design/pro-components';
import { adminTableRequest } from '@/services/api';
import { listDeviceSources } from '@/services/admin/dashboard';
import type { AdminDeviceBindingItem } from '@/types/admin';

const VENDOR_COLOR: Record<string, string> = {
  garmin: 'green',
  huawei: 'orange',
  coros: 'purple',
  vivo: 'cyan',
  wechat: 'blue',
  mi: 'gold',
  ble: 'default',
};

export default function DeviceSourcesPage() {
  const { message } = AntdApp.useApp();

  const columns: ProColumns<AdminDeviceBindingItem>[] = [
    {
      title: '用户',
      dataIndex: 'userNickname',
      width: 140,
      render: (_, r) => r.userNickname ?? r.userId.slice(0, 8),
    },
    {
      title: '设备品牌',
      dataIndex: 'vendor',
      width: 130,
      valueType: 'select',
      valueEnum: {
        garmin: { text: '佳明' },
        huawei: { text: '华为' },
        coros: { text: 'COROS' },
        vivo: { text: 'VIVO' },
        wechat: { text: '微信运动' },
        mi: { text: '小米' },
        ble: { text: '通用 BLE' },
      },
      render: (_, r) => <Tag color={VENDOR_COLOR[r.vendor] ?? 'default'}>{r.vendor}</Tag>,
    },
    {
      title: '绑定时间',
      dataIndex: 'boundAt',
      valueType: 'dateTime',
      width: 160,
      search: false,
    },
    {
      title: '最近同步',
      dataIndex: 'lastDataAt',
      valueType: 'dateTime',
      width: 160,
      search: false,
      render: (v: React.ReactNode) => v ? <>{v}</> : <Tag color="red">无</Tag>,
    },
    {
      title: '近 7 天汇总',
      dataIndex: 'last7Days',
      width: 200,
      search: false,
      render: (_, r) => {
        if (!r.last7Days || r.last7Days.length === 0) {
          return <Tag color="orange">无数据</Tag>;
        }
        const totalSteps = r.last7Days.reduce((s, d) => s + d.steps, 0);
        const totalDist = r.last7Days.reduce((s, d) => s + d.distanceM, 0);
        const totalCal = r.last7Days.reduce((s, d) => s + d.caloriesKcal, 0);
        return (
          <Space size={4}>
            <Tag color="blue">{totalSteps.toLocaleString()} 步</Tag>
            <Tag color="cyan">{(totalDist / 1000).toFixed(1)} km</Tag>
            <Tag color="orange">{totalCal} kcal</Tag>
          </Space>
        );
      },
    },
  ];

  // 顶部统计卡
  const stats = {
    boundCount: 0,
    totalSteps7d: 0,
    totalDist7dM: 0,
  };

  return (
    <PageContainer
      header={{
        title: '设备数据源',
        subTitle: 'V0.3.35 sprint B · DeviceBinding + DeviceDailyActivity 最近 7 天',
      }}
    >
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Statistic title="绑定设备数" value={stats.boundCount} suffix="个" />
        </Col>
        <Col span={8}>
          <Statistic title="近 7 天总步数" value={stats.totalSteps7d.toLocaleString()} suffix="步" />
        </Col>
        <Col span={8}>
          <Statistic title="近 7 天总距离" value={(stats.totalDist7dM / 1000).toFixed(1)} suffix="km" />
        </Col>
      </Row>
      <ProTable<AdminDeviceBindingItem>
        rowKey="id"
        columns={columns}
        request={adminTableRequest<AdminDeviceBindingItem>('listDeviceSources', message)}
      />
    </PageContainer>
  );
}