/**
 * 上传管理（V0.1.150）— 用户数据导入列表 + 重试解析
 * listUploads / retryParse（COS 中转异步解析：小米/COROS/华为/佳明）
 */
import { Button, Tag, App as AntdApp } from 'antd';
import { PageContainer, ProTable, type ProColumns } from '@ant-design/pro-components';
import { retryParse } from '@/services/admin';
import { adminTableRequest } from '@/services/api';
import type { UploadListItem, UploadStatus } from '@/types/admin';

const STATUS_COLOR: Record<UploadStatus, string> = {
  pending: 'default',
  parsing: 'processing',
  parsed: 'success',
  failed: 'error',
};

export default function UploadsPage() {
  const { message } = AntdApp.useApp();

  const columns: ProColumns<UploadListItem>[] = [
    {
      title: '用户',
      dataIndex: ['user', 'nickname'],
      search: false,
      render: (_, r) => r.user.nickname ?? r.user.phone ?? r.userId.slice(0, 8),
    },
    { title: '类型', dataIndex: 'type', width: 140, search: false },
    {
      title: '大小',
      dataIndex: 'size',
      width: 100,
      search: false,
      render: (_, r) => `${Math.round(r.size / 1024)} KB`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      valueType: 'select',
      valueEnum: {
        pending: { text: '待解析' },
        parsing: { text: '解析中' },
        parsed: { text: '已解析' },
        failed: { text: '失败' },
      },
      render: (_, r) => <Tag color={STATUS_COLOR[r.status]}>{r.status}</Tag>,
    },
    { title: '错误信息', dataIndex: 'errorMsg', ellipsis: true, search: false },
    {
      title: '时间',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      width: 160,
      search: false,
    },
    {
      title: '操作',
      width: 100,
      search: false,
      render: (_, r) => (
        <Button
          size="small"
          disabled={r.status === 'parsing'}
          onClick={async () => {
            try {
              await retryParse({ id: r.id });
              message.success('已重新入队解析');
            } catch (e) {
              message.error((e as Error).message);
            }
          }}
        >
          重试
        </Button>
      ),
    },
  ];

  return (
    <PageContainer header={{ title: '上传管理', subTitle: '用户数据导入（COS 中转异步解析 V0.1.150）' }}>
      <ProTable<UploadListItem>
        rowKey="id"
        columns={columns}
        request={adminTableRequest<UploadListItem>('listUploads', message)}
      />
    </PageContainer>
  );
}
