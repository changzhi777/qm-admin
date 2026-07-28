/**
 * 邀请裂变管理（V0.2.6）— 邀请榜 + 手动调积分 + 送会员
 * listInviteStats / adjustPoints / grantMember
 */
import { useRef, useState } from 'react';
import {
  PageContainer,
  ProTable,
  type ActionType,
  type ProColumns,
} from '@ant-design/pro-components';
import { Button, Modal, Form, InputNumber, Input, Tag, App as AntdApp } from 'antd';
import { safeMessageError } from '@/utils/safeMessage';
import { adjustPoints, grantMember } from '@/services/admin';
import { adminTableRequest } from '@/services/api';
import type { InviteStatsItem } from '@/types/admin';

export default function InvitePage() {
  const { message } = AntdApp.useApp();
  const actionRef = useRef<ActionType>();
  const [pointsTarget, setPointsTarget] = useState<InviteStatsItem | null>(null);
  const [memberTarget, setMemberTarget] = useState<InviteStatsItem | null>(null);
  const [pointsForm] = Form.useForm<{ change: number; reason?: string }>();
  const [memberForm] = Form.useForm<{ days: number }>();
  const [submitting, setSubmitting] = useState(false);

  const submitPoints = async () => {
    if (!pointsTarget) return;
    const v = await pointsForm.validateFields();
    setSubmitting(true);
    try {
      await adjustPoints({ userId: pointsTarget.id, change: v.change, reason: v.reason });
      message.success('积分已调整');
      setPointsTarget(null);
      pointsForm.resetFields();
    } catch (e) {
      safeMessageError(message, e);
    } finally {
      setSubmitting(false);
    }
  };

  const submitMember = async () => {
    if (!memberTarget) return;
    const v = await memberForm.validateFields();
    setSubmitting(true);
    try {
      await grantMember({ userId: memberTarget.id, days: v.days });
      message.success('会员时长已赠送');
      setMemberTarget(null);
      memberForm.resetFields();
    } catch (e) {
      safeMessageError(message, e);
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ProColumns<InviteStatsItem>[] = [
    {
      title: '邀请人',
      dataIndex: 'nickname',
      render: (_, r) => r.nickname ?? r.id.slice(0, 8),
    },
    { title: '邀请码', dataIndex: 'inviteCode', search: false },
    {
      title: '分销等级',
      dataIndex: 'distributorLevel',
      width: 100,
      search: false,
      render: (_, r) => <Tag color="blue">{r.distributorLevel}</Tag>,
    },
    { title: '邀请数', dataIndex: 'inviteCount', width: 90, search: false },
    {
      title: '操作',
      width: 200,
      search: false,
      render: (_, r) => (
        <>
          <Button
            size="small"
            onClick={() => {
              setPointsTarget(r);
              pointsForm.resetFields();
            }}
          >
            调积分
          </Button>
          <Button
            size="small"
            style={{ marginLeft: 8 }}
            onClick={() => {
              setMemberTarget(r);
              memberForm.resetFields();
            }}
          >
            送会员
          </Button>
        </>
      ),
    },
  ];

  return (
    <PageContainer header={{ title: '邀请裂变管理', subTitle: '邀请榜 + 手动调积分 + 送会员（V0.2.6）' }}>
      <ProTable<InviteStatsItem>
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        search={false}
        request={adminTableRequest<InviteStatsItem>('listInviteStats', message)}
      />
      <Modal
        title="调整积分"
        open={!!pointsTarget}
        onCancel={() => setPointsTarget(null)}
        onOk={submitPoints}
        confirmLoading={submitting}
        okText="确认调整"
        destroyOnClose
      >
        {pointsTarget && (
          <p>
            用户：{pointsTarget.nickname ?? pointsTarget.id.slice(0, 8)}（已邀请{' '}
            {pointsTarget.inviteCount} 人）
          </p>
        )}
        <Form form={pointsForm} layout="vertical">
          <Form.Item
            label="积分变动（±，正加负扣）"
            name="change"
            rules={[{ required: true, message: '请输入变动值' }]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="原因（选填）" name="reason">
            <Input maxLength={100} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="赠送会员时长"
        open={!!memberTarget}
        onCancel={() => setMemberTarget(null)}
        onOk={submitMember}
        confirmLoading={submitting}
        okText="确认赠送"
        destroyOnClose
      >
        {memberTarget && (
          <p>用户：{memberTarget.nickname ?? memberTarget.id.slice(0, 8)}</p>
        )}
        <Form form={memberForm} layout="vertical">
          <Form.Item
            label="赠送天数"
            name="days"
            rules={[{ required: true, message: '请输入天数' }]}
          >
            <InputNumber min={1} max={3650} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
}
