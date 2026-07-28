/**
 * 商品管理 — 列表 + 新建/编辑（ModalForm）
 *
 * 列表：listProducts（mall.routes.ts，支持分页 + category 过滤）
 * 写：upsertProduct（admin.routes.ts，id 缺省 = create）
 */
import { useRef, useState } from 'react';
import {
  PageContainer,
  ProTable,
  ModalForm,
  ProFormText,
  ProFormDigit,
  ProFormSelect,
  ProFormTextArea,
  type ActionType,
  type ProColumns,
} from '@ant-design/pro-components';
import { Button, Image, App as AntdApp } from 'antd';
import { safeMessageError } from '@/utils/safeMessage';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import { listProducts, listCategories } from '@/services/mall';
import { upsertProduct } from '@/services/admin';
import type { ProductSummary } from '@/types/mall';

export default function ProductsPage() {
  const { message } = AntdApp.useApp();
  const actionRef = useRef<ActionType>();
  const [editTarget, setEditTarget] = useState<ProductSummary | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const columns: ProColumns<ProductSummary>[] = [
    {
      title: '图',
      dataIndex: 'images',
      width: 70,
      search: false,
      render: (_, r) =>
        r.images?.[0] ? (
          <Image src={r.images[0]} width={48} height={48} style={{ objectFit: 'cover' }} />
        ) : (
          <span style={{ color: '#bbb' }}>无</span>
        ),
    },
    { title: '名称', dataIndex: 'name' },
    { title: '分类', dataIndex: 'category', width: 100 },
    {
      title: '价格',
      dataIndex: 'price',
      width: 100,
      search: false,
      render: (_, r) => `¥${r.price}`,
    },
    { title: '库存', dataIndex: 'stock', width: 80, search: false },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      valueEnum: {
        on: { text: '上架', status: 'Success' },
        off: { text: '下架', status: 'Default' },
      },
    },
    { title: '排序', dataIndex: 'sort', width: 70, search: false },
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
    <PageContainer header={{ title: '商品管理' }}>
      <ProTable<ProductSummary>
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        request={async (params) => {
          try {
            const resp = await listProducts({
              category: params.category as string | undefined,
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
            新建商品
          </Button>,
        ]}
      />

      <ModalForm
        title={editTarget ? `编辑：${editTarget.name}` : '新建商品'}
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialValues={
          editTarget
            ? {
                ...editTarget,
                price: Number(editTarget.price),
                // null / undefined → undefined（不传字段）；非空 → Number 转换
                originalPrice:
                  editTarget.originalPrice != null
                    ? Number(editTarget.originalPrice)
                    : undefined,
                memberDiscount:
                  editTarget.memberDiscount != null
                    ? Number(editTarget.memberDiscount)
                    : undefined,
                images: (editTarget.images ?? []).join('\n'),
              }
            : { status: 'on', stock: 0, sort: 0 }
        }
        onFinish={async (values) => {
          try {
            // 显式 null/空 检查（避免 Number(null)=0 误写后端，后端 originalPrice 是 positive optional）
            const toOptionalNumber = (v: unknown): number | undefined => {
              if (v == null || v === '') return undefined;
              const n = Number(v);
              return Number.isFinite(n) ? n : undefined;
            };
            await upsertProduct({
              id: editTarget?.id,
              name: values.name,
              category: values.category,
              brand: values.brand || undefined,
              price: Number(values.price),
              originalPrice: toOptionalNumber(values.originalPrice),
              memberDiscount: toOptionalNumber(values.memberDiscount),
              images:
                typeof values.images === 'string'
                  ? values.images
                      .split('\n')
                      .map((s: string) => s.trim())
                      .filter(Boolean)
                  : values.images ?? [],
              description: values.description || undefined,
              stock: Number(values.stock ?? 0),
              status: values.status as 'on' | 'off',
              sort: Number(values.sort ?? 0),
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
        <ProFormText name="name" label="名称" rules={[{ required: true }]} />
        <ProFormSelect
          name="category"
          label="分类"
          rules={[{ required: true }]}
          request={async () => {
            const resp = await listCategories();
            return resp.list.map((c) => ({ label: c.name, value: c.id }));
          }}
        />
        <ProFormText name="brand" label="品牌" />
        <ProFormDigit name="price" label="价格" min={0.01} rules={[{ required: true }]} />
        <ProFormDigit name="originalPrice" label="原价" min={0.01} />
        <ProFormDigit name="memberDiscount" label="会员折扣（0~1）" min={0} max={1} fieldProps={{ step: 0.01 }} />
        <ProFormDigit name="stock" label="库存" min={0} fieldProps={{ precision: 0 }} />
        <ProFormTextArea
          name="images"
          label="图片 URL（每行一个）"
          fieldProps={{ rows: 3 }}
        />
        <ProFormTextArea name="description" label="描述" fieldProps={{ rows: 4 }} />
        <ProFormSelect
          name="status"
          label="状态"
          options={[
            { label: '上架', value: 'on' },
            { label: '下架', value: 'off' },
          ]}
        />
        <ProFormDigit name="sort" label="排序" fieldProps={{ precision: 0 }} />
      </ModalForm>
    </PageContainer>
  );
}
