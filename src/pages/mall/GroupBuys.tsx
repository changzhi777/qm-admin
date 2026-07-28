/**
 * 团购管理 — 列表 + 新建/编辑（ModalForm）
 *
 * 列表：listGroupBuys（admin.routes.ts，分页 + status 过滤）
 * 写：upsertGroupBuy（admin.routes.ts，id 缺省 = create）
 */
import { useRef, useState } from 'react';
import {
  PageContainer,
  ProTable,
  ModalForm,
  ProFormDigit,
  ProFormSelect,
  ProFormDateTimePicker,
  type ActionType,
  type ProColumns,
} from '@ant-design/pro-components';
import { Button, App as AntdApp } from 'antd';
import { safeMessageError } from '@/utils/safeMessage';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import { listProducts } from '@/services/mall';
import { listGroupBuys, upsertGroupBuy } from '@/services/admin';
import type { GroupBuyListItem } from '@/types/admin';

export default function GroupBuysPage() {
  const { message } = AntdApp.useApp();
  const actionRef = useRef<ActionType>();
  const [editTarget, setEditTarget] = useState<GroupBuyListItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const columns: ProColumns<GroupBuyListItem>[] = [
    {
      title: '商品',
      dataIndex: 'productId',
      render: (_, r) => r.product?.name ?? '-',
    },
    {
      title: '团购价',
      dataIndex: 'groupPrice',
      width: 100,
      search: false,
      render: (_, r) => `¥${r.groupPrice}`,
    },
    {
      title: '原价',
      width: 90,
      search: false,
      render: (_, r) => `¥${r.product?.price ?? '-'}`,
    },
    {
      title: '进度',
      width: 120,
      search: false,
      render: (_, r) => `${r.currentCount} / ${r.targetCount} 人`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      valueEnum: {
        active: { text: '进行中', status: 'Processing' },
        reached: { text: '已成团', status: 'Success' },
      },
    },
    {
      title: '截止',
      dataIndex: 'endDate',
      width: 160,
      search: false,
      render: (_, r) => (r.endDate ? new Date(r.endDate).toLocaleString('zh-CN') : '不限'),
    },
    {
      title: '操作',
      width: 100,
      search: false,
      render: (_, r) => (
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={() => {
            setEditTarget(r);
            setModalOpen(true);
          }}
        >
          编辑
        </Button>
      ),
    },
  ];

  return (
    <PageContainer header={{ title: '团购管理' }}>
      <ProTable<GroupBuyListItem>
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        request={async (params) => {
          try {
            const resp = await listGroupBuys({
              status: params.status as 'active' | 'reached' | undefined,
              page: params.current ?? 1,
              pageSize: params.pageSize ?? 20,
            });
            return { data: resp.list, success: true, total: resp.total };
          } catch (e) {
            safeMessageError(message, e);
            return { data: [], success: false, total: 0 };
          }
        }}
        toolBarRender={() => [
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditTarget(null);
              setModalOpen(true);
            }}
          >
            新建团购
          </Button>,
        ]}
      />

      <ModalForm
        title={editTarget ? `编辑团购：${editTarget.product?.name}` : '新建团购'}
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialValues={
          editTarget
            ? {
                productId: editTarget.productId,
                groupPrice: Number(editTarget.groupPrice),
                targetCount: editTarget.targetCount,
                endDate: editTarget.endDate ?? undefined,
              }
            : { targetCount: 10 }
        }
        onFinish={async (values) => {
          try {
            await upsertGroupBuy({
              id: editTarget?.id,
              productId: values.productId,
              groupPrice: Number(values.groupPrice),
              targetCount: Number(values.targetCount),
              endDate: values.endDate || undefined,
            });
            message.success(editTarget ? '已更新' : '已新建');
            actionRef.current?.reload();
            return true;
          } catch (e) {
            safeMessageError(message, e);
            return false;
          }
        }}
      >
        <ProFormSelect
          name="productId"
          label="商品"
          rules={[{ required: true, message: '请选择商品' }]}
          disabled={!!editTarget}
          request={async () => {
            const resp = await listProducts({ page: 1, pageSize: 100 });
            return resp.list.map((p) => ({ label: `${p.name} (¥${p.price})`, value: p.id }));
          }}
        />
        <ProFormDigit
          name="groupPrice"
          label="团购价"
          min={0.01}
          fieldProps={{ step: 0.01 }}
          rules={[{ required: true, message: '请输入团购价' }]}
        />
        <ProFormDigit
          name="targetCount"
          label="成团人数"
          min={2}
          max={1000}
          fieldProps={{ precision: 0 }}
          rules={[{ required: true, message: '请输入成团人数' }]}
        />
        <ProFormDateTimePicker
          name="endDate"
          label="截止时间（可选，不填=长期）"
          transform={(v) => (v ? new Date(v as string).toISOString() : undefined)}
        />
      </ModalForm>
    </PageContainer>
  );
}
