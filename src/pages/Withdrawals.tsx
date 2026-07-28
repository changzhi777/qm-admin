/**
 * 提现管理（V0.1.122）— 列表 + 审核通过/拒绝
 * listWithdrawals / approveWithdrawal（扣钱包）/ rejectWithdrawal
 */
import { useRef, useState } from 'react';
import {
  PageContainer,
  ProTable,
  type ActionType,
  type ProColumns,
} from '@ant-design/pro-components';
import {
  Tag,
  Space,
  Button,
  Popconfirm,
  Typography,
  App as AntdApp,
} from 'antd';
import {
  approveWithdrawal,
  rejectWithdrawal,
} from '@/services/admin';
import { adminTableRequest, downloadAdminCsv } from '@/services/api';
import type {
  WithdrawalListItem,
  WithdrawalStatus,
} from '@/types/admin';

const STATUS_META: Record<WithdrawalStatus, { text: string; color: string }> = {
  pending: { text: '待审核', color: 'orange' },
  approved: { text: '已通过', color: 'green' },
  rejected: { text: '已拒绝', color: 'red' },
};

export default function WithdrawalsPage() {
  const { message } = AntdApp.useApp();
  const actionRef = useRef<ActionType>();
  const [acting, setActing] = useState<Record<string, boolean>>({});

  const act = async (r: WithdrawalListItem, approve: boolean) => {
    if (acting[r.id]) return;
    setActing((s) => ({ ...s, [r.id]: true }));
    try {
      if (approve) await approveWithdrawal({ id: r.id });
      else await rejectWithdrawal({ id: r.id });
      message.success(approve ? '已通过（钱包已扣减）' : '已拒绝');
      actionRef.current?.reload();
    } catch (e) {
      message.error((e as Error).message);
    } finally {
      setActing((s) => {
        const { [r.id]: _, ...rest } = s;
        return rest;
      });
    }
  };

  const columns: ProColumns<WithdrawalListItem>[] = [
    {
      title: '用户',
      dataIndex: ['user', 'nickname'],
      search: false,
      render: (_, r) => r.user.nickname ?? '匿名',
    },
    {
      title: '金额',
      dataIndex: 'amount',
      width: 100,
      search: false,
      render: (_, r) => `¥${r.amount}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      valueType: 'select',
      valueEnum: Object.fromEntries(
        Object.entries(STATUS_META).map(([k, v]) => [k, { text: v.text }]),
      ),
      render: (_, r) => (
        <Tag color={STATUS_META[r.status]?.color}>
          {STATUS_META[r.status]?.text ?? r.status}
        </Tag>
      ),
    },
    {
      title: '原因',
      dataIndex: 'reason',
      search: false,
      ellipsis: true,
      render: (_, r) => r.reason ?? '-',
    },
    {
      title: '申请时间',
      dataIndex: 'createdAt',
      width: 160,
      valueType: 'dateTime',
      search: false,
    },
    {
      title: '操作',
      width: 180,
      search: false,
      render: (_, r) =>
        r.status !== 'pending' ? (
          <Typography.Text type="secondary">已处理</Typography.Text>
        ) : (
          <Space>
            <Popconfirm
              title="确认通过提现？将从用户钱包扣减并标记已处理。"
              onConfirm={() => act(r, true)}
            >
              <Button size="small" type="primary" loading={!!acting[r.id]}>
                通过
              </Button>
            </Popconfirm>
            <Popconfirm
              title="确认拒绝提现？"
              onConfirm={() => act(r, false)}
            >
              <Button size="small" danger loading={!!acting[r.id]}>
                拒绝
              </Button>
            </Popconfirm>
          </Space>
        ),
    },
  ];

  return (
    <PageContainer
      header={{
        title: '提现管理',
        extra: (
          <Space>
            <Button
              onClick={async () => {
                try {
                  const ym = new Date().toISOString().slice(0, 7);
                  await downloadAdminCsv(
                    'exportSettlement',
                    { yearMonth: ym },
                    `settlement-${ym}.csv`,
                  );
                  message.success('结算单导出成功');
                } catch (e) {
                  message.error((e as Error).message);
                }
              }}
            >
              导出本月结算单
            </Button>
          </Space>
        ),
      }}
    >
      <ProTable<WithdrawalListItem>
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        request={adminTableRequest<WithdrawalListItem>(
          'listWithdrawals',
          message,
          (p) => ({ ...(p.status ? { status: p.status } : {}) }),
        )}
      />
    </PageContainer>
  );
}
