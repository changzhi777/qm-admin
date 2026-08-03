/**
 * 打卡记录管理 — V0.3.35 sprint B
 *
 * admin.listCheckins 全站打卡列表 + 多维过滤（用户/运动类型/数据源/日期/距离区间）
 * 复用 adminTableRequest 范式 + ProTable 自动 request 适配
 */
import { App as AntdApp, Tag } from 'antd';
import { PageContainer, ProTable, type ProColumns } from '@ant-design/pro-components';
import { adminTableRequest } from '@/services/api';
import { listCheckins } from '@/services/admin/dashboard';
import type { AdminCheckinListItem } from '@/types/admin';

const SOURCE_COLOR: Record<string, string> = {
  manual: 'blue',
  garmin: 'green',
  huawei_export: 'orange',
  coros_fit: 'purple',
  sport_screenshot: 'cyan',
};

const SPORT_COLOR: Record<string, string> = {
  run: 'green',
  hike: 'lime',
  ride: 'gold',
  other: 'default',
};

export default function CheckinsPage() {
  const { message } = AntdApp.useApp();

  const columns: ProColumns<AdminCheckinListItem>[] = [
    {
      title: '用户',
      dataIndex: 'userNickname',
      width: 140,
      render: (_, r) => r.userNickname ?? r.userId.slice(0, 8),
    },
    {
      title: '日期',
      dataIndex: 'date',
      width: 110,
      valueType: 'dateRange',
      search: { transform: (v) => ({ dateFrom: v[0], dateTo: v[1] }) },
    },
    {
      title: '运动',
      dataIndex: 'sportType',
      width: 80,
      valueType: 'select',
      valueEnum: { run: { text: '跑' }, hike: { text: '徒步' }, ride: { text: '骑行' }, other: { text: '其他' } },
      render: (_, r) => r.sportType ? <Tag color={SPORT_COLOR[r.sportType] ?? 'default'}>{r.sportType}</Tag> : '-',
    },
    {
      title: '距离 (km)',
      dataIndex: 'distance',
      width: 110,
      valueType: 'digit',
      search: false,
      render: (v: React.ReactNode) => <>{Number(v).toFixed(2)}</>,
    },
    {
      title: '时长',
      dataIndex: 'durationSec',
      width: 90,
      search: false,
      render: (v: React.ReactNode) => v ? <>{Math.floor(Number(v) / 60)}分{Number(v) % 60}秒</> : '-',
    },
    {
      title: '配速',
      dataIndex: 'pace',
      width: 80,
      search: false,
    },
    {
      title: '心率',
      dataIndex: 'heartRate',
      width: 80,
      search: false,
      render: (v: React.ReactNode) => v ? <>{v} bpm</> : '-',
    },
    {
      title: '积分',
      dataIndex: 'points',
      width: 80,
      search: false,
    },
    {
      title: '数据源',
      dataIndex: 'dataSource',
      width: 110,
      valueType: 'select',
      valueEnum: {
        manual: { text: '手动' },
        garmin: { text: '佳明' },
        huawei_export: { text: '华为' },
        coros_fit: { text: 'COROS' },
        sport_screenshot: { text: '截图' },
      },
      render: (_, r) => <Tag color={SOURCE_COLOR[r.dataSource] ?? 'default'}>{r.dataSource}</Tag>,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      width: 160,
      search: false,
    },
  ];

  return (
    <PageContainer
      header={{ title: '打卡记录', subTitle: 'V0.3.35 sprint B · admin.listCheckins 全站打卡' }}
    >
      <ProTable<AdminCheckinListItem>
        rowKey="id"
        columns={columns}
        request={adminTableRequest<AdminCheckinListItem>('listCheckins', message)}
      />
    </PageContainer>
  );
}