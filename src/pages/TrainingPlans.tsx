/**
 * 训练计划管理（V0.1.123）— CRUD（listTrainingPlans + upsertTrainingPlan）
 * 注意：listTrainingPlans 返全量 {list}（无分页），手动 request
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
  App as AntdApp,
} from 'antd';
import { safeMessageError } from '@/utils/safeMessage';
import { listTrainingPlans, upsertTrainingPlan } from '@/services/admin';
import type {
  TrainingPlanListItem,
  TrainingPlanUpsertInput,
} from '@/types/admin';

const LEVEL_OPTIONS = [
  { label: '入门', value: 'beginner' },
  { label: '进阶', value: 'intermediate' },
  { label: '挑战', value: 'challenge' },
  { label: '极限', value: 'extreme' },
];

export default function TrainingPlansPage() {
  const { message } = AntdApp.useApp();
  const actionRef = useRef<ActionType>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form] = Form.useForm<TrainingPlanUpsertInput>();
  const [submitting, setSubmitting] = useState(false);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ level: 'beginner', weeks: 8, targetKm: 50, status: 'active' });
    setModalOpen(true);
  };

  const openEdit = (r: TrainingPlanListItem) => {
    setEditId(r.id);
    form.setFieldsValue(r);
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
      await upsertTrainingPlan(editId ? { ...values, id: editId } : values);
      message.success(editId ? '已更新' : '已创建');
      closeModal();
      actionRef.current?.reload();
    } catch (e) {
      safeMessageError(message, e);
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ProColumns<TrainingPlanListItem>[] = [
    { title: 'Key', dataIndex: 'key', width: 80, search: false, copyable: true },
    { title: '名称', dataIndex: 'name', search: false },
    {
      title: '难度',
      dataIndex: 'level',
      width: 80,
      search: false,
      render: (_, r) =>
        LEVEL_OPTIONS.find((o) => o.value === r.level)?.label ?? r.level,
    },
    { title: '周数', dataIndex: 'weeks', width: 60, search: false },
    { title: '目标跑量', dataIndex: 'targetKm', width: 90, search: false, render: (_, r) => `${r.targetKm}km` },
    { title: '目标', dataIndex: 'goal', search: false, ellipsis: true },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      valueType: 'select',
      valueEnum: { active: { text: '启用' }, archived: { text: '归档' } },
      render: (_, r) => (
        <Tag color={r.status === 'active' ? 'green' : 'default'}>
          {r.status === 'active' ? '启用' : '归档'}
        </Tag>
      ),
    },
    {
      title: '操作',
      width: 80,
      search: false,
      render: (_, r) => (
        <Button size="small" onClick={() => openEdit(r)}>
          编辑
        </Button>
      ),
    },
  ];

  return (
    <PageContainer header={{ title: '训练计划' }}>
      <ProTable<TrainingPlanListItem>
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        toolBarRender={() => [
          <Button key="create" type="primary" onClick={openCreate}>
            新建计划
          </Button>,
        ]}
        request={async (params) => {
          try {
            const resp = await listTrainingPlans({
              status: params.status as 'active' | 'archived' | undefined,
            });
            return {
              data: resp.list,
              success: true,
              total: resp.list.length,
            };
          } catch (e) {
            safeMessageError(message, e);
            return { data: [], success: false, total: 0 };
          }
        }}
      />
      <Modal
        title={editId ? '编辑计划' : '新建计划'}
        open={modalOpen}
        onCancel={closeModal}
        onOk={submit}
        confirmLoading={submitting}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Key（唯一标识）" name="key" rules={[{ required: true }]}>
            <Input placeholder="5k / 10k / half / full / 自定义" />
          </Form.Item>
          <Form.Item label="名称" name="name" rules={[{ required: true }]}>
            <Input placeholder="5K 入门计划" />
          </Form.Item>
          <Form.Item label="难度" name="level" rules={[{ required: true }]}>
            <Select options={LEVEL_OPTIONS} />
          </Form.Item>
          <Form.Item label="周数" name="weeks" rules={[{ required: true }]}>
            <InputNumber min={1} max={52} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="目标跑量（km）" name="targetKm" rules={[{ required: true }]}>
            <InputNumber min={1} step={0.1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="目标描述" name="goal">
            <Input placeholder="完成首个 5K" />
          </Form.Item>
          <Form.Item label="计划描述" name="desc">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item label="每周里程参考" name="weeklyMileage">
            <Input placeholder="10-20km/week" />
          </Form.Item>
          <Form.Item label="状态" name="status">
            <Select
              options={[
                { label: '启用', value: 'active' },
                { label: '归档', value: 'archived' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
}
