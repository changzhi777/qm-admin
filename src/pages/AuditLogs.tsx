/**
 * 审计日志（V0.1.124）— admin 操作记录查看
 * listAuditLogs（分页 + action/actorOpenid 过滤）
 */
import { Tag, Typography, App as AntdApp } from 'antd';
import { PageContainer, ProTable, type ProColumns } from '@ant-design/pro-components';
import { listAuditLogs } from '@/services/admin';
import { adminTableRequest } from '@/services/api';
import type { AuditLogListItem } from '@/types/admin';

export default function AuditLogsPage() {
  const { message } = AntdApp.useApp();

  const columns: ProColumns<AuditLogListItem>[] = [
    {
      title: '时间',
      dataIndex: 'createdAt',
      width: 180,
      valueType: 'dateTime',
      search: false,
    },
    {
      title: '操作',
      dataIndex: 'action',
      width: 160,
      copyable: true,
    },
    {
      title: '操作者 openid',
      dataIndex: 'actorOpenid',
      width: 220,
      copyable: true,
      ellipsis: true,
    },
    {
      title: '目标',
      dataIndex: 'target',
      width: 140,
      search: false,
      render: (_, r) =>
        r.target ? (
          <Tag>{r.target}</Tag>
        ) : (
          <Typography.Text type="secondary">-</Typography.Text>
        ),
    },
    {
      title: '详情',
      dataIndex: 'payload',
      search: false,
      ellipsis: true,
      render: (_, r) => {
        if (!r.payload || (typeof r.payload === 'object' && Object.keys(r.payload as object).length === 0)) {
          return <Typography.Text type="secondary">-</Typography.Text>;
        }
        return (
          <Typography.Text code style={{ fontSize: 12 }}>
            {JSON.stringify(r.payload).slice(0, 120)}
          </Typography.Text>
        );
      },
    },
    {
      title: 'IP',
      dataIndex: 'ip',
      width: 80,
      search: false,
      render: (_, r) => <Typography.Text type="secondary">{r.ip}</Typography.Text>,
    },
  ];

  return (
    <PageContainer header={{ title: '审计日志' }}>
      <ProTable<AuditLogListItem>
        rowKey="id"
        columns={columns}
        search={{ labelWidth: 'auto' }}
        request={adminTableRequest<AuditLogListItem>(
          'listAuditLogs',
          message,
          (p) => ({
            ...(p.action ? { action: p.action } : {}),
            ...(p.actorOpenid ? { actorOpenid: p.actorOpenid } : {}),
          }),
        )}
      />
    </PageContainer>
  );
}
