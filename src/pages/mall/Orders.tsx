/**
 * 订单管理 — 列表 + 状态扭转
 *
 * 列表：admin/listOrders（分页 + 状态过滤）
 * 写：admin/updateOrderStatus（5 个枚举）
 */
import { useRef } from 'react';
import {
  PageContainer,
  ProTable,
  type ActionType,
  type ProColumns,
} from '@ant-design/pro-components';
import { Tag, Select, Space, Popconfirm, Typography, App as AntdApp } from 'antd';
import { listOrders, updateOrderStatus } from '@/services/admin';
import type { OrderListItem, OrderStatus } from '@/types/admin';

const STATUS_META: Record<OrderStatus, { text: string; color: string }> = {
  pending_pay: { text: '待支付', color: 'orange' },
  paid: { text: '已支付', color: 'blue' },
  shipped: { text: '已发货', color: 'cyan' },
  done: { text: '已完成', color: 'green' },
  cancelled: { text: '已取消', color: 'red' },
};

const NEXT_STATUS: Record<OrderStatus, OrderStatus[]> = {
  pending_pay: ['paid', 'cancelled'],
  paid: ['shipped', 'cancelled'],
  shipped: ['done', 'cancelled'],
  done: [],
  cancelled: [],
};

export default function OrdersPage() {
  const { message } = AntdApp.useApp();
  const actionRef = useRef<ActionType>();

  const columns: ProColumns<OrderListItem>[] = [
    { title: '订单号', dataIndex: 'id', width: 220, copyable: true, search: false },
    {
      title: '用户',
      width: 140,
      search: false,
      render: (_, r) => (
        <Space direction="vertical" size={0}>
          <span>{r.user?.nickname ?? '匿名'}</span>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {r.user?.phone ?? '-'}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: '商品',
      search: false,
      render: (_, r) => (
        <Space direction="vertical" size={0}>
          {r.items.map((i) => (
            <span key={i.id}>
              {i.productName} × {i.quantity}
            </span>
          ))}
        </Space>
      ),
    },
    {
      title: '应付',
      dataIndex: 'totalAmount',
      width: 90,
      search: false,
      render: (_, r) => `¥${r.totalAmount}`,
    },
    {
      title: '实付',
      dataIndex: 'payAmount',
      width: 90,
      search: false,
      render: (_, r) => `¥${r.payAmount}`,
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
        <Tag color={STATUS_META[r.status].color}>{STATUS_META[r.status].text}</Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 160,
      valueType: 'dateTime',
      search: false,
    },
    {
      title: '操作',
      width: 200,
      search: false,
      render: (_, r) => {
        const nexts = NEXT_STATUS[r.status];
        if (nexts.length === 0) return <Typography.Text type="secondary">—</Typography.Text>;
        return (
          <Select
            placeholder="扭转状态"
            size="small"
            style={{ width: 160 }}
            value={undefined}
            options={nexts.map((s) => ({ label: STATUS_META[s].text, value: s }))}
            onChange={async (next: OrderStatus) => {
              try {
                await updateOrderStatus({ orderId: r.id, status: next });
                message.success(`已扭转：${STATUS_META[r.status].text} → ${STATUS_META[next].text}`);
                actionRef.current?.reload();
              } catch (e) {
                message.error((e as Error).message);
              }
            }}
          />
        );
      },
    },
  ];

  return (
    <PageContainer header={{ title: '订单管理' }}>
      <ProTable<OrderListItem>
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        request={async (params) => {
          try {
            const resp = await listOrders({
              status: params.status as OrderStatus | undefined,
              page: params.current ?? 1,
              pageSize: params.pageSize ?? 20,
            });
            return { data: resp.list, success: true, total: resp.total };
          } catch (e) {
            message.error((e as Error).message);
            return { data: [], success: false, total: 0 };
          }
        }}
      />
    </PageContainer>
  );
}
