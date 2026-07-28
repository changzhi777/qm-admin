/**
 * 赛事成绩管理（V0.1.134）— 选赛事 → 报名列表 → 录入成绩
 * listEnrollmentsByContent / submitRaceResult（赛事 type=marathon）
 */
import { useState, useEffect } from 'react';
import {
  PageContainer,
  ProTable,
  type ProColumns,
} from '@ant-design/pro-components';
import {
  Button,
  Modal,
  Form,
  InputNumber,
  Input,
  Select,
  Tag,
  Space,
  App as AntdApp,
} from 'antd';
import { safeMessageError } from '@/utils/safeMessage';
import { submitRaceResult, listEnrollmentsByContent, listContents } from '@/services/admin';
import type { EnrollmentListItem, ContentListItem } from '@/types/admin';

export default function RacePage() {
  const { message } = AntdApp.useApp();
  const [contentId, setContentId] = useState<string>();
  const [contents, setContents] = useState<ContentListItem[]>([]);
  const [list, setList] = useState<EnrollmentListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [resultTarget, setResultTarget] = useState<EnrollmentListItem | null>(null);
  const [form] = Form.useForm<{
    finishTimeSec: number;
    rank?: number;
    bibNumber?: string;
  }>();
  const [submitting, setSubmitting] = useState(false);

  const loadContents = async () => {
    try {
      const r = await listContents({ type: 'marathon' });
      setContents(r.list);
    } catch (e) {
      safeMessageError(message, e);
    }
  };

  const loadEnrollments = async (id: string) => {
    setLoading(true);
    try {
      const r = await listEnrollmentsByContent(id);
      setList(r.list);
    } catch (e) {
      safeMessageError(message, e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadContents();
  }, []);

  const submitResult = async () => {
    if (!resultTarget) return;
    const v = await form.validateFields();
    setSubmitting(true);
    try {
      await submitRaceResult({
        enrollmentId: resultTarget.id,
        finishTimeSec: v.finishTimeSec,
        rank: v.rank,
        bibNumber: v.bibNumber,
      });
      message.success('成绩已录入');
      setResultTarget(null);
      form.resetFields();
      if (contentId) void loadEnrollments(contentId);
    } catch (e) {
      safeMessageError(message, e);
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ProColumns<EnrollmentListItem>[] = [
    {
      title: '用户',
      dataIndex: ['user', 'nickname'],
      render: (_, r) => r.user.nickname ?? r.user.phone ?? r.userId.slice(0, 8),
    },
    { title: '报名状态', dataIndex: 'status', width: 100 },
    {
      title: '已录成绩',
      dataIndex: ['raceResult', 'finishTimeSec'],
      width: 120,
      render: (_, r) =>
        r.raceResult ? (
          <Tag color="green">
            {r.raceResult.finishTimeSec}s
            {r.raceResult.rank ? ` · 第${r.raceResult.rank}名` : ''}
          </Tag>
        ) : (
          <Tag>未录入</Tag>
        ),
    },
    { title: '报名时间', dataIndex: 'createdAt', valueType: 'dateTime', width: 160 },
    {
      title: '操作',
      width: 100,
      render: (_, r) => (
        <Button
          size="small"
          onClick={() => {
            setResultTarget(r);
            form.resetFields();
          }}
        >
          {r.raceResult ? '修改成绩' : '录入成绩'}
        </Button>
      ),
    },
  ];

  return (
    <PageContainer header={{ title: '赛事成绩管理', subTitle: '选赛事 → 报名列表 → 录入（V0.1.134）' }}>
      <Space style={{ marginBottom: 16 }}>
        <span>选择赛事：</span>
        <Select
          style={{ width: 360 }}
          placeholder="选择马拉松赛事"
          value={contentId}
          onChange={(v) => {
            setContentId(v);
            void loadEnrollments(v);
          }}
          options={contents.map((c) => ({ label: c.title, value: c.id }))}
        />
      </Space>
      <ProTable<EnrollmentListItem>
        rowKey="id"
        loading={loading}
        dataSource={list}
        columns={columns}
        search={false}
        pagination={{ pageSize: 20 }}
        options={contentId ? { reload: () => void loadEnrollments(contentId) } : false}
      />
      <Modal
        title="录入赛事成绩"
        open={!!resultTarget}
        onCancel={() => setResultTarget(null)}
        onOk={submitResult}
        confirmLoading={submitting}
        okText="提交成绩"
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="完赛用时（秒）"
            name="finishTimeSec"
            rules={[{ required: true, message: '请输入完赛秒数' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} placeholder="如全马 14400 = 4 小时" />
          </Form.Item>
          <Form.Item label="名次（选填）" name="rank">
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="参赛号（选填）" name="bibNumber">
            <Input maxLength={20} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
}
