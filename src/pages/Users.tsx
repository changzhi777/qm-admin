/**
 * 用户管理（V0.1.122）— 列表 + 封禁/解封
 * listUsers / banUser（reason）/ unbanUser
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
  Popconfirm,
  Typography,
  Modal,
  Form,
  Input,
  App as AntdApp,
} from 'antd';
import { safeMessageError } from '@/utils/safeMessage';
import { banUser, unbanUser } from '@/services/admin';
import { adminTableRequest, downloadAdminCsv } from '@/services/api';
import type { UserListItem } from '@/types/admin';

export default function UsersPage() {
  const { message } = AntdApp.useApp();
  const actionRef = useRef<ActionType>();
  const [banTarget, setBanTarget] = useState<UserListItem | null>(null);
  const [banForm] = Form.useForm<{ reason: string }>();
  const [acting, setActing] = useState<Record<string, boolean>>({});

  const submitBan = async () => {
    if (!banTarget) return;
    const values = await banForm.validateFields();
    const targetId = banTarget.id;
    setActing((s) => ({ ...s, [targetId]: true }));
    try {
      await banUser({ openid: banTarget.openid, reason: values.reason });
      message.success('已封禁');
      setBanTarget(null);
      banForm.resetFields();
      actionRef.current?.reload();
    } catch (e) {
      safeMessageError(message, e);
    } finally {
      setActing((s) => {
        const { [targetId]: _, ...rest } = s;
        return rest;
      });
    }
  };

  const unban = async (r: UserListItem) => {
    setActing((s) => ({ ...s, [r.id]: true }));
    try {
      await unbanUser({ openid: r.openid });
      message.success('已解封');
      actionRef.current?.reload();
    } catch (e) {
      safeMessageError(message, e);
    } finally {
      setActing((s) => {
        const { [r.id]: _, ...rest } = s;
        return rest;
      });
    }
  };

  const columns: ProColumns<UserListItem>[] = [
    {
      title: '昵称',
      dataIndex: 'nickname',
      search: false,
      render: (_, r) => r.nickname ?? '未设置',
    },
    {
      title: 'openid',
      dataIndex: 'openid',
      search: false,
      copyable: true,
      ellipsis: true,
    },
    {
      title: '手机',
      dataIndex: 'phone',
      search: false,
      render: (_, r) => r.phone ?? '-',
    },
    { title: '积分', dataIndex: 'points', width: 80, search: false },
    {
      title: '状态',
      dataIndex: 'isBanned',
      width: 80,
      search: false,
      render: (_, r) =>
        r.isBanned ? (
          <Tag color="red">已封禁</Tag>
        ) : (
          <Tag color="green">正常</Tag>
        ),
    },
    {
      title: '注册',
      dataIndex: 'createdAt',
      width: 160,
      valueType: 'dateTime',
      search: false,
    },
    {
      title: '操作',
      width: 100,
      search: false,
      render: (_, r) =>
        r.isBanned ? (
          <Popconfirm title="确认解封？" onConfirm={() => unban(r)}>
            <Button size="small" loading={!!acting[r.id]}>
              解封
            </Button>
          </Popconfirm>
        ) : (
          <Button
            size="small"
            danger
            loading={!!acting[r.id]}
            onClick={() => {
              setBanTarget(r);
              banForm.resetFields();
            }}
          >
            封禁
          </Button>
        ),
    },
  ];

  return (
    <PageContainer header={{ title: '用户管理' }}>
      <ProTable<UserListItem>
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        search={false}
        toolBarRender={() => [
          <Button
            key="export"
            onClick={async () => {
              try {
                await downloadAdminCsv('exportUsers', {}, `users-${Date.now()}.csv`);
                message.success('导出成功');
              } catch (e) {
                safeMessageError(message, e);
              }
            }}
          >
            导出 CSV
          </Button>,
        ]}
        request={adminTableRequest<UserListItem>('listUsers', message)}
      />
      <Modal
        title="封禁用户"
        open={!!banTarget}
        onCancel={() => setBanTarget(null)}
        onOk={submitBan}
        okText="确认封禁"
        okButtonProps={{ danger: true }}
        destroyOnClose
      >
        {banTarget && (
          <Typography.Paragraph>
            封禁 <strong>{banTarget.nickname ?? banTarget.openid}</strong>
            ，封禁后该用户无法登录。
          </Typography.Paragraph>
        )}
        <Form form={banForm} layout="vertical">
          <Form.Item label="封禁原因" name="reason">
            <Input.TextArea rows={2} maxLength={100} placeholder="选填" />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
}
