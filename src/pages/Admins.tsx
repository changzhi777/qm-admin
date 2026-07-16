/**
 * 管理员账号管理（V0.2.8，super-admin only）— listAdmins + createAdmin + updateAdmin
 * RBAC：仅 super-admin 可访问（后端 checkPermission 守卫 + 前端 super-admin 可见路由）
 */
import { useState } from 'react';
import { PageContainer, ProTable, type ProColumns } from '@ant-design/pro-components';
import { Button, Modal, Form, Input, Select, Tag, Switch, App as AntdApp } from 'antd';
import { adminCall } from '@/services/api';
import type { AdminListItem } from '@/types/admin';

const ROLE_COLOR: Record<string, string> = {
  'super-admin': 'red',
  admin: 'blue',
  operator: 'default',
};

export default function AdminsPage() {
  const { message } = AntdApp.useApp();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminListItem | null>(null);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = () => setReloadKey((k) => k + 1);

  const submitCreate = async () => {
    const v = await createForm.validateFields();
    setSubmitting(true);
    try {
      await adminCall('createAdmin', v);
      message.success('已创建');
      setCreateOpen(false);
      createForm.resetFields();
      reload();
    } catch (e) {
      message.error((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const submitEdit = async () => {
    if (!editTarget) return;
    const v = await editForm.validateFields();
    setSubmitting(true);
    try {
      await adminCall('updateAdmin', {
        id: editTarget.id,
        role: v.role,
        disabled: v.disabled,
        ...(v.password ? { password: v.password } : {}),
      });
      message.success('已更新');
      setEditTarget(null);
      editForm.resetFields();
      reload();
    } catch (e) {
      message.error((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ProColumns<AdminListItem>[] = [
    { title: '用户名', dataIndex: 'username', search: false },
    {
      title: '角色',
      dataIndex: 'role',
      width: 120,
      search: false,
      render: (_, r) => <Tag color={ROLE_COLOR[r.role] ?? 'default'}>{r.role}</Tag>,
    },
    { title: '昵称', dataIndex: 'nickname', search: false },
    {
      title: '最后登录',
      dataIndex: 'lastLoginAt',
      valueType: 'dateTime',
      search: false,
      width: 160,
    },
    {
      title: '状态',
      dataIndex: 'disabled',
      width: 80,
      search: false,
      render: (_, r) =>
        r.disabled ? <Tag color="red">禁用</Tag> : <Tag color="green">正常</Tag>,
    },
    {
      title: '操作',
      width: 100,
      search: false,
      render: (_, r) => (
        <Button
          size="small"
          onClick={() => {
            setEditTarget(r);
            editForm.resetFields();
          }}
        >
          编辑
        </Button>
      ),
    },
  ];

  return (
    <PageContainer
      header={{
        title: '管理员账号',
        subTitle: 'V0.2.8 RBAC（super-admin only）',
        extra: (
          <Button
            type="primary"
            onClick={() => {
              setCreateOpen(true);
              createForm.resetFields();
            }}
          >
            新建管理员
          </Button>
        ),
      }}
    >
      <ProTable<AdminListItem>
        key={reloadKey}
        rowKey="id"
        columns={columns}
        search={false}
        pagination={false}
        request={async () => {
          try {
            const r = await adminCall<{ list: AdminListItem[] }>('listAdmins');
            return { data: r.list, success: true };
          } catch (e) {
            message.error((e as Error).message);
            return { data: [], success: false };
          }
        }}
      />
      <Modal
        title="新建管理员"
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onOk={submitCreate}
        confirmLoading={submitting}
        destroyOnClose
      >
        <Form form={createForm} layout="vertical">
          <Form.Item label="用户名" name="username" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="密码" name="password" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item label="角色" name="role" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'super-admin' },
                { value: 'admin' },
                { value: 'operator' },
              ]}
            />
          </Form.Item>
          <Form.Item label="昵称" name="nickname">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="编辑管理员"
        open={!!editTarget}
        onCancel={() => setEditTarget(null)}
        onOk={submitEdit}
        confirmLoading={submitting}
        destroyOnClose
      >
        {editTarget && (
          <p>
            {editTarget.username}（{editTarget.role}）
          </p>
        )}
        <Form
          form={editForm}
          layout="vertical"
          initialValues={{ role: editTarget?.role, disabled: editTarget?.disabled }}
        >
          <Form.Item label="新密码（留空不改）" name="password">
            <Input.Password />
          </Form.Item>
          <Form.Item label="角色" name="role">
            <Select
              options={[
                { value: 'super-admin' },
                { value: 'admin' },
                { value: 'operator' },
              ]}
            />
          </Form.Item>
          <Form.Item label="禁用" name="disabled" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
}
