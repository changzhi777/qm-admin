/**
 * 评价管理（V0.1.122）— 列表 + 回复
 * listReviews（admin 查所有评价）/ addReviewReply
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
  Typography,
  App as AntdApp,
} from 'antd';
import { addReviewReply } from '@/services/admin';
import { adminTableRequest } from '@/services/api';
import type { ReviewListItem } from '@/types/admin';

export default function ReviewsPage() {
  const { message } = AntdApp.useApp();
  const actionRef = useRef<ActionType>();
  const [replyTarget, setReplyTarget] = useState<ReviewListItem | null>(null);
  const [replyForm] = Form.useForm<{ content: string }>();
  const [submitting, setSubmitting] = useState(false);

  const submitReply = async () => {
    if (!replyTarget) return;
    const values = await replyForm.validateFields();
    setSubmitting(true);
    try {
      await addReviewReply({ reviewId: replyTarget.id, content: values.content });
      message.success('已回复');
      setReplyTarget(null);
      replyForm.resetFields();
      actionRef.current?.reload();
    } catch (e) {
      message.error((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ProColumns<ReviewListItem>[] = [
    { title: '商品', dataIndex: ['product', 'name'], search: false },
    {
      title: '用户',
      dataIndex: ['user', 'nickname'],
      search: false,
      render: (_, r) => r.user.nickname ?? '匿名',
    },
    {
      title: '评分',
      dataIndex: 'rating',
      width: 80,
      search: false,
      render: (_, r) => <Tag color="gold">{r.rating}★</Tag>,
    },
    { title: '内容', dataIndex: 'content', search: false, ellipsis: true },
    {
      title: '回复',
      dataIndex: 'replyContent',
      search: false,
      width: 200,
      ellipsis: true,
      render: (_, r) =>
        r.replyContent ?? (
          <Typography.Text type="secondary">未回复</Typography.Text>
        ),
    },
    {
      title: '时间',
      dataIndex: 'createdAt',
      width: 160,
      valueType: 'dateTime',
      search: false,
    },
    {
      title: '操作',
      width: 100,
      search: false,
      render: (_, r) => (
        <Button
          size="small"
          onClick={() => {
            setReplyTarget(r);
            replyForm.resetFields();
          }}
        >
          {r.replyContent ? '修改回复' : '回复'}
        </Button>
      ),
    },
  ];

  return (
    <PageContainer header={{ title: '评价管理' }}>
      <ProTable<ReviewListItem>
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        search={false}
        request={adminTableRequest<ReviewListItem>('listReviews', message)}
      />
      <Modal
        title="回复评价"
        open={!!replyTarget}
        onCancel={() => setReplyTarget(null)}
        onOk={submitReply}
        confirmLoading={submitting}
        okText="提交回复"
        destroyOnClose
      >
        {replyTarget && (
          <Typography.Paragraph type="secondary" style={{ marginBottom: 16 }}>
            {replyTarget.user.nickname ?? '匿名'} 给 {replyTarget.product.name} 打{' '}
            {replyTarget.rating}★
            {replyTarget.content && `："${replyTarget.content}"`}
          </Typography.Paragraph>
        )}
        <Form form={replyForm} layout="vertical">
          <Form.Item
            label="回复内容"
            name="content"
            rules={[
              { required: true, message: '请输入回复' },
              { max: 500 },
            ]}
          >
            <Input.TextArea rows={3} maxLength={500} showCount placeholder="商家回复..." />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
}
