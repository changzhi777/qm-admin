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
  Space,
  Popconfirm,
  Typography,
  Modal,
  Form,
  Input,
  App as AntdApp,
  Drawer,
  Tabs,
  Descriptions,
  Spin,
  Table,
} from 'antd';
import { safeMessageError } from '@/utils/safeMessage';
import { banUser, unbanUser, getUserDetail } from '@/services/admin';
import { adminTableRequest, downloadAdminCsv, downloadAdminExcel } from '@/services/api';
import type { UserDetailResp, UserListItem } from '@/types/admin';

export default function UsersPage() {
  const { message } = AntdApp.useApp();
  const actionRef = useRef<ActionType>();
  const [banTarget, setBanTarget] = useState<UserListItem | null>(null);
  const [banForm] = Form.useForm<{ reason: string }>();
  const [acting, setActing] = useState<Record<string, boolean>>({});
  // V0.3.34 A2：用户详情 Drawer 状态
  const [detailUserId, setDetailUserId] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<UserDetailResp | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const openDetail = async (userId: string) => {
    setDetailUserId(userId);
    setDetailData(null);
    setDetailLoading(true);
    try {
      const data = await getUserDetail(userId);
      setDetailData(data);
    } catch (e) {
      safeMessageError(message, e);
    } finally {
      setDetailLoading(false);
    }
  };

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
      width: 150,
      search: false,
      render: (_, r) => (
        <Space>
          {/* V0.3.34 A2：详情按钮 */}
          <Button
            size="small"
            type="link"
            onClick={() => openDetail(r.id)}
          >
            详情
          </Button>
          {r.isBanned ? (
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
          )}
        </Space>
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
          <Space key="export-buttons">
            <Button
              key="export-csv"
              onClick={async () => {
                try {
                  await downloadAdminCsv('exportUsers', {}, `users-${Date.now()}.csv`);
                  message.success('导出 CSV 成功');
                } catch (e) {
                  safeMessageError(message, e);
                }
              }}
            >
              导出 CSV
            </Button>
            <Button
              key="export-excel"
              type="primary"
              onClick={async () => {
                try {
                  await downloadAdminExcel('exportUsersExcel', {});
                  message.success('导出 Excel 成功');
                } catch (e) {
                  safeMessageError(message, e);
                }
              }}
            >
              导出 Excel
            </Button>
          </Space>,
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

      {/* V0.3.34 A2：用户详情 Drawer（5 维度聚合）*/}
      <Drawer
        title="用户详情"
        open={!!detailUserId}
        onClose={() => {
          setDetailUserId(null);
          setDetailData(null);
        }}
        width={720}
        destroyOnClose
      >
        {detailLoading ? (
          <Spin tip="加载中..." style={{ width: '100%' }} />
        ) : detailData ? (
          <Tabs
            defaultActiveKey="basic"
            items={[
              {
                key: 'basic',
                label: '基本信息',
                children: (
                  <Descriptions column={2} bordered size="small">
                    <Descriptions.Item label="用户ID">{detailData.user.id}</Descriptions.Item>
                    <Descriptions.Item label="OpenID">{detailData.user.openid}</Descriptions.Item>
                    <Descriptions.Item label="昵称">{detailData.user.nickname ?? '-'}</Descriptions.Item>
                    <Descriptions.Item label="手机">{detailData.user.phone ?? '-'}</Descriptions.Item>
                    <Descriptions.Item label="积分">{detailData.user.points}</Descriptions.Item>
                    <Descriptions.Item label="状态">
                      {detailData.user.isBanned ? <Tag color="red">已封禁</Tag> : <Tag color="green">正常</Tag>}
                    </Descriptions.Item>
                    <Descriptions.Item label="封禁原因" span={2}>
                      {detailData.user.bannedReason ?? '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="会员到期">
                      {detailData.user.memberExpireAt
                        ? new Date(detailData.user.memberExpireAt).toLocaleString('zh-CN')
                        : '未开通'}
                    </Descriptions.Item>
                    <Descriptions.Item label="注册时间">
                      {new Date(detailData.user.createdAt).toLocaleString('zh-CN')}
                    </Descriptions.Item>
                  </Descriptions>
                ),
              },
              {
                key: 'training',
                label: `训练 (30天)`,
                children: (
                  <Descriptions column={1} bordered size="small">
                    <Descriptions.Item label="打卡次数">
                      {detailData.training.checkinCount30d} 次
                    </Descriptions.Item>
                    <Descriptions.Item label="跑步距离">
                      {detailData.training.distanceKm30d} km
                    </Descriptions.Item>
                    <Descriptions.Item label="力量训练">
                      {detailData.training.strengthSessions30d} 次
                    </Descriptions.Item>
                  </Descriptions>
                ),
              },
              {
                key: 'orders',
                label: `订单 (${detailData.orders.total})`,
                children: (
                  <Descriptions column={1} bordered size="small">
                    <Descriptions.Item label="订单总数">
                      {detailData.orders.total} 个
                    </Descriptions.Item>
                    <Descriptions.Item label="已支付">
                      {detailData.orders.paid} 个
                    </Descriptions.Item>
                    <Descriptions.Item label="总营收">
                      ¥{(detailData.orders.totalRevenueFen / 100).toFixed(2)}
                    </Descriptions.Item>
                  </Descriptions>
                ),
              },
              {
                key: 'points',
                label: `积分流水 (${detailData.points.recentTransactions.length})`,
                children: detailData.points.recentTransactions.length === 0 ? (
                  <Typography.Text type="secondary">暂无流水</Typography.Text>
                ) : (
                  <Table
                    size="small"
                    dataSource={detailData.points.recentTransactions}
                    rowKey="id"
                    pagination={false}
                    columns={[
                      { title: '时间', dataIndex: 'createdAt', render: (v: string) => new Date(v).toLocaleString('zh-CN') },
                      { title: '类型', dataIndex: 'type' },
                      { title: '变动', dataIndex: 'change', render: (v: number) => v > 0 ? `+${v}` : v },
                      { title: '原因', dataIndex: 'reason' },
                    ]}
                  />
                ),
              },
              {
                key: 'audit',
                label: `审计 (${detailData.auditLogs.length})`,
                children: detailData.auditLogs.length === 0 ? (
                  <Typography.Text type="secondary">暂无审计记录</Typography.Text>
                ) : (
                  <Table
                    size="small"
                    dataSource={detailData.auditLogs}
                    rowKey="id"
                    pagination={false}
                    columns={[
                      { title: '时间', dataIndex: 'createdAt', render: (v: string) => new Date(v).toLocaleString('zh-CN') },
                      { title: '动作', dataIndex: 'action' },
                      { title: '目标', dataIndex: 'target' },
                    ]}
                  />
                ),
              },
            ]}
          />
        ) : null}
      </Drawer>
    </PageContainer>
  );
}
