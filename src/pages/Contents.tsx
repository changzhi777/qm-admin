/**
 * 内容管理（V0.1.122）— 赛事/酒店/景区/餐饮/乡村 CRUD
 * listContents（分页 + type/status 过滤）/ upsertContent（create/edit）
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
  Button,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Space,
  App as AntdApp,
} from 'antd';
import { safeMessageError } from '@/utils/safeMessage';
import { upsertContent } from '@/services/admin';
import { adminTableRequest } from '@/services/api';
import type {
  ContentListItem,
  ContentType,
  ContentActionType,
  ContentUpsertInput,
} from '@/types/admin';

const TYPE_OPTIONS: { label: string; value: ContentType }[] = [
  { label: '赛事', value: 'marathon' },
  { label: '酒店', value: 'hotel' },
  { label: '景区', value: 'scenic' },
  { label: '餐饮', value: 'food' },
  { label: '乡村', value: 'rural' },
];
const ACTION_OPTIONS: { label: string; value: ContentActionType }[] = [
  { label: '报名', value: 'enroll' },
  { label: '预订', value: 'book' },
  { label: '链接', value: 'link' },
  { label: '仅展示', value: 'none' },
];

export default function ContentsPage() {
  const { message } = AntdApp.useApp();
  const actionRef = useRef<ActionType>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form] = Form.useForm<ContentUpsertInput>();
  const [submitting, setSubmitting] = useState(false);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({
      type: 'marathon',
      actionType: 'enroll',
      status: 'on',
      sort: 0,
      fee: 0,
      price: 0,
    });
    setModalOpen(true);
  };

  const openEdit = (r: ContentListItem) => {
    setEditId(r.id);
    form.setFieldsValue({
      id: r.id,
      type: r.type,
      title: r.title,
      cover: r.cover ?? '',
      summary: r.summary ?? '',
      fee: Number(r.fee ?? 0),
      price: Number(r.price ?? 0),
      date: r.date ?? '',
      location: r.location ?? '',
      actionType: r.actionType,
      status: r.status,
      sort: r.sort,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    form.resetFields();
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSubmitting(true);
    try {
      await upsertContent(editId ? { ...values, id: editId } : values);
      message.success(editId ? '已更新' : '已创建');
      closeModal();
      actionRef.current?.reload();
    } catch (e) {
      safeMessageError(message, e);
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ProColumns<ContentListItem>[] = [
    { title: '标题', dataIndex: 'title', search: false },
    {
      title: '类型',
      dataIndex: 'type',
      width: 90,
      valueType: 'select',
      valueEnum: Object.fromEntries(
        TYPE_OPTIONS.map((o) => [o.value, { text: o.label }]),
      ),
    },
    {
      title: '报名费',
      dataIndex: 'fee',
      width: 80,
      search: false,
      render: (_, r) => (r.fee ? `¥${r.fee}` : '-'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      valueType: 'select',
      valueEnum: {
        on: { text: '上架' },
        off: { text: '下架' },
      },
      render: (_, r) => (
        <Tag color={r.status === 'on' ? 'green' : 'default'}>
          {r.status === 'on' ? '上架' : '下架'}
        </Tag>
      ),
    },
    {
      title: '操作',
      width: 90,
      search: false,
      render: (_, r) => (
        <Button size="small" onClick={() => openEdit(r)}>
          编辑
        </Button>
      ),
    },
  ];

  return (
    <PageContainer header={{ title: '内容管理' }}>
      <ProTable<ContentListItem>
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        toolBarRender={() => [
          <Button key="create" type="primary" onClick={openCreate}>
            新建内容
          </Button>,
        ]}
        request={adminTableRequest<ContentListItem>(
          'listContents',
          message,
          (p) => ({
            ...(p.type ? { type: p.type } : {}),
            ...(p.status ? { status: p.status } : {}),
          }),
        )}
      />
      <Modal
        title={editId ? '编辑内容' : '新建内容'}
        open={modalOpen}
        onCancel={closeModal}
        onOk={submit}
        confirmLoading={submitting}
        width={640}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Space style={{ width: '100%' }} size={[16, 0]}>
            <Form.Item
              label="类型"
              name="type"
              rules={[{ required: true }]}
              style={{ width: 150 }}
            >
              <Select options={TYPE_OPTIONS} />
            </Form.Item>
            <Form.Item label="操作类型" name="actionType" style={{ width: 150 }}>
              <Select options={ACTION_OPTIONS} />
            </Form.Item>
          </Space>
          <Form.Item
            label="标题"
            name="title"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item label="封面图 URL" name="cover">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item label="摘要" name="summary">
            <Input.TextArea rows={2} maxLength={200} />
          </Form.Item>
          <Space style={{ width: '100%' }} size={[16, 0]}>
            <Form.Item label="报名费（元）" name="fee" style={{ width: 150 }}>
              <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="展示价（元）" name="price" style={{ width: 150 }}>
              <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
            </Form.Item>
          </Space>
          <Space style={{ width: '100%' }} size={[16, 0]}>
            <Form.Item label="日期" name="date" style={{ width: 200 }}>
              <Input placeholder="2026-10-01" />
            </Form.Item>
            <Form.Item label="地点" name="location" style={{ flex: 1 }}>
              <Input placeholder="北京" />
            </Form.Item>
          </Space>
          <Space style={{ width: '100%' }} size={[16, 0]}>
            <Form.Item label="排序" name="sort" style={{ width: 100 }}>
              <InputNumber min={0} />
            </Form.Item>
            <Form.Item label="状态" name="status" style={{ width: 100 }}>
              <Select
                options={[
                  { label: '上架', value: 'on' },
                  { label: '下架', value: 'off' },
                ]}
              />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </PageContainer>
  );
}
