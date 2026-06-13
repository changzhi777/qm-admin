/**
 * 订单管理 — 列表 + 状态扭转 + 退款
 *
 * 列表：admin/listOrders（分页 + 状态过滤）
 * 写：admin/updateOrderStatus（5 个枚举）
 * 退款：admin/refundOrder（Phase 4.1）— 仅 status=paid 时可触发
 *
 * 状态机收紧（V1）：
 * - paid → cancelled 已禁止（必须走 refund 流程）
 * - paid → shipped 仍允许（发货）
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
  Select,
  Space,
  Button,
  Modal,
  Form,
  InputNumber,
  Input,
  Typography,
  App as AntdApp,
} from 'antd';
import { listOrders, updateOrderStatus, refundOrder } from '@/services/admin';
import type { OrderListItem, OrderStatus } from '@/types/admin';

const STATUS_META: Record<OrderStatus, { text: string; color: string }> = {
  pending_pay: { text: '待支付', color: 'orange' },
  paid: { text: '已支付', color: 'blue' },
  shipped: { text: '已发货', color: 'cyan' },
  done: { text: '已完成', color: 'green' },
  cancelled: { text: '已取消', color: 'red' },
  refunding: { text: '退款中', color: 'gold' },
  refunded: { text: '已退款', color: 'purple' },
};

// 状态机白名单（与后端 apps/server/src/domain/order-state.ts 对齐）
// V1 收紧：paid → cancelled 禁止（必须走 refund 流程）
const NEXT_STATUS: Record<OrderStatus, OrderStatus[]> = {
  pending_pay: ['paid', 'cancelled'],
  paid: ['shipped'], // V1: 不再含 cancelled
  shipped: ['done', 'cancelled'],
  done: [],
  cancelled: [],
  refunding: [],
  refunded: [],
};

interface RefundFormValues {
  amountFen: number;
  reason?: string;
}

export default function OrdersPage() {
  const { message } = AntdApp.useApp();
  const actionRef = useRef<ActionType>();
  // 并发锁：扭转中的 orderId 集合，避免重复提交
  const [transitioning, setTransitioning] = useState<Record<string, boolean>>({});
  // 退款弹窗
  const [refundTarget, setRefundTarget] = useState<OrderListItem | null>(null);
  const [refundForm] = Form.useForm<RefundFormValues>();

  const openRefundModal = (r: OrderListItem) => {
    setRefundTarget(r);
    refundForm.setFieldsValue({
      amountFen: Math.round(Number(r.payAmount) * 100),
      reason: '',
    });
  };

  const closeRefundModal = () => {
    setRefundTarget(null);
    refundForm.resetFields();
  };

  const submitRefund = async () => {
    if (!refundTarget) return;
    const values = await refundForm.validateFields();
    if (transitioning[refundTarget.id]) return;
    setTransitioning((s) => ({ ...s, [refundTarget.id]: true }));
    try {
      const result = await refundOrder({
        orderId: refundTarget.id,
        amountFen: values.amountFen,
        reason: values.reason,
      });
      message.success(
        `已退款：¥${result.refundYuan} (微信 ${result.status})`,
      );
      closeRefundModal();
      actionRef.current?.reload();
    } catch (e) {
      message.error((e as Error).message);
    } finally {
      setTransitioning((s) => {
        const { [refundTarget.id]: _, ...rest } = s;
        return rest;
      });
    }
  };

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
        <Tag color={STATUS_META[r.status]?.color ?? 'default'}>
          {STATUS_META[r.status]?.text ?? r.status}
        </Tag>
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
      width: 260,
      search: false,
      render: (_, r) => {
        const nexts = NEXT_STATUS[r.status] ?? [];
        const loading = !!transitioning[r.id];
        const canRefund = r.status === 'paid';
        if (nexts.length === 0 && !canRefund) {
          return <Typography.Text type="secondary">—</Typography.Text>;
        }
        return (
          <Space>
            {canRefund && (
              <Button
                size="small"
                danger
                loading={loading}
                onClick={() => openRefundModal(r)}
              >
                退款
              </Button>
            )}
            {nexts.length > 0 && (
              <Select
                placeholder={loading ? '扭转中...' : '扭转状态'}
                size="small"
                style={{ width: 140 }}
                value={undefined}
                disabled={loading}
                options={nexts.map((s) => ({ label: STATUS_META[s]?.text ?? s, value: s }))}
                onChange={async (next: OrderStatus) => {
                  if (transitioning[r.id]) return;
                  setTransitioning((s) => ({ ...s, [r.id]: true }));
                  try {
                    await updateOrderStatus({ orderId: r.id, status: next });
                    message.success(
                      `已扭转：${STATUS_META[r.status]?.text ?? r.status} → ${STATUS_META[next]?.text ?? next}`,
                    );
                    actionRef.current?.reload();
                  } catch (e) {
                    message.error((e as Error).message);
                  } finally {
                    setTransitioning((s) => {
                      const { [r.id]: _, ...rest } = s;
                      return rest;
                    });
                  }
                }}
              />
            )}
          </Space>
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

      <Modal
        title="发起退款"
        open={!!refundTarget}
        onCancel={closeRefundModal}
        onOk={submitRefund}
        confirmLoading={!!(refundTarget && transitioning[refundTarget.id])}
        okText="确认退款"
        cancelText="取消"
        destroyOnClose
      >
        {refundTarget && (
          <>
            <Typography.Paragraph type="secondary" style={{ marginBottom: 16 }}>
              订单 <Typography.Text code>{refundTarget.id}</Typography.Text> 实付{' '}
              <Typography.Text strong>¥{refundTarget.payAmount}</Typography.Text>
            </Typography.Paragraph>
            <Form<RefundFormValues> form={refundForm} layout="vertical">
              <Form.Item
                label="退款金额（分）"
                name="amountFen"
                rules={[
                  { required: true, message: '请输入退款金额' },
                  {
                    type: 'number',
                    min: 1,
                    max: Math.round(Number(refundTarget.payAmount) * 100),
                    message: `必须在 1 ~ ${Math.round(Number(refundTarget.payAmount) * 100)} 分之间`,
                  },
                ]}
              >
                <InputNumber
                  min={1}
                  max={Math.round(Number(refundTarget.payAmount) * 100)}
                  step={1}
                  style={{ width: '100%' }}
                  addonAfter="分"
                />
              </Form.Item>
              <Form.Item label="退款原因" name="reason">
                <Input.TextArea
                  rows={2}
                  maxLength={80}
                  showCount
                  placeholder="如：用户申请 / 商家协商 / 系统错误"
                />
              </Form.Item>
            </Form>
            <Typography.Text type="warning" style={{ fontSize: 12 }}>
              ⚠️ 退款将从用户钱包余额扣除，并调微信 refund API。一旦成功不可撤销。
            </Typography.Text>
          </>
        )}
      </Modal>
    </PageContainer>
  );
}
