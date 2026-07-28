/**
 * 配置管理（V0.2.7）— 功能开关 setConfig
 * 注：当前值读取待后端 readConfig（下方默认关闭，提交覆盖；运营可先查 DB app_config.feature_flags）
 */
import { useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Form, Switch, Button, Card, Typography, App as AntdApp } from 'antd';
import { safeMessageError } from '@/utils/safeMessage';
import { setConfig } from '@/services/admin';

// 功能开关清单（与后端 feature-flags.ts 对齐）
const FEATURE_FLAGS = [
  'wallet',
  'payment',
  'membership',
  'mall',
  'distribution',
  'smartAgent',
] as const;

export default function ConfigPage() {
  const { message } = AntdApp.useApp();
  const [flagForm] = Form.useForm<Record<string, boolean>>();
  const [submitting, setSubmitting] = useState(false);

  const submitFlags = async () => {
    const v = await flagForm.validateFields();
    setSubmitting(true);
    try {
      await setConfig({ id: 'feature_flags', value: v });
      message.success('功能开关已更新');
    } catch (e) {
      safeMessageError(message, e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer header={{ title: '配置管理', subTitle: '功能开关 setConfig（V0.2.7）' }}>
      <Card title="功能开关">
        <Typography.Paragraph type="secondary" style={{ marginBottom: 16 }}>
          注：当前值读取待后端 readConfig，下方默认关闭；提交即覆盖
          app_config.feature_flags（运营可先查 DB 确认当前值）。
        </Typography.Paragraph>
        <Form form={flagForm} layout="inline" style={{ flexWrap: 'wrap', gap: 8 }}>
          {FEATURE_FLAGS.map((f) => (
            <Form.Item key={f} label={f} name={f} valuePropName="checked" initialValue={false}>
              <Switch />
            </Form.Item>
          ))}
        </Form>
        <Button
          type="primary"
          style={{ marginTop: 16 }}
          loading={submitting}
          onClick={submitFlags}
        >
          保存功能开关
        </Button>
      </Card>
    </PageContainer>
  );
}
