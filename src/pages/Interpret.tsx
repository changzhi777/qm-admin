/**
 * 解读管理（V0.2.37）— interpret 解读记录列表（minimax M3 资料解读）
 * listInterpret：佳明 FIT / 病历图片 / 运动截图 → minimax M3 解读记录
 */
import { Tag, App as AntdApp } from 'antd';
import { PageContainer, ProTable, type ProColumns } from '@ant-design/pro-components';
import { adminTableRequest } from '@/services/api';
import type { InterpretListItem } from '@/types/admin';

const TYPE_COLOR: Record<string, string> = {
  garmin_fit: 'green',
  garmin_zip: 'green',
  medical: 'blue',
  screenshot: 'orange',
};

export default function InterpretPage() {
  const { message } = AntdApp.useApp();

  const columns: ProColumns<InterpretListItem>[] = [
    {
      title: '用户',
      dataIndex: 'nickname',
      width: 120,
      search: false,
      render: (_, r) => r.nickname ?? r.userId.slice(0, 8),
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: 130,
      valueType: 'select',
      valueEnum: {
        garmin_fit: { text: '佳明 FIT' },
        garmin_zip: { text: '佳明 ZIP' },
        medical: { text: '病历图片' },
        screenshot: { text: '运动截图' },
      },
      render: (_, r) => <Tag color={TYPE_COLOR[r.type] ?? 'default'}>{r.type}</Tag>,
    },
    { title: '资料 Key', dataIndex: 'inputKey', ellipsis: true, search: false },
    { title: '模型', dataIndex: 'model', width: 130, search: false },
    {
      title: 'Tokens（入/出）',
      width: 130,
      search: false,
      render: (_, r) => `${r.inputTokens ?? 0} / ${r.outputTokens ?? 0}`,
    },
    { title: '解读结果', dataIndex: 'result', ellipsis: true, search: false },
    { title: '时间', dataIndex: 'createdAt', valueType: 'dateTime', width: 160, search: false },
  ];

  return (
    <PageContainer header={{ title: '解读管理', subTitle: 'AI 资料解读记录（minimax M3 V0.2.37）' }}>
      <ProTable<InterpretListItem>
        rowKey="id"
        columns={columns}
        request={adminTableRequest<InterpretListItem>('listInterpret', message)}
      />
    </PageContainer>
  );
}
