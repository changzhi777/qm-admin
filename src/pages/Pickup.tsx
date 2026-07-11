/**
 * 自提核销（V0.1.122）— 输入 pickupCode 核销
 * confirmPickup（pickupCode = 订单号末 6 位 + 3 位大写字母数字）
 */
import { useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Input, Button, Result, App as AntdApp, Space } from 'antd';
import { confirmPickup } from '@/services/admin';

export default function PickupPage() {
  const { message } = AntdApp.useApp();
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const submit = async () => {
    if (!code.trim()) {
      message.warning('请输入核销码');
      return;
    }
    setSubmitting(true);
    try {
      await confirmPickup({ pickupCode: code.trim() });
      setSuccess(true);
      message.success('核销成功');
      setCode('');
    } catch (e) {
      message.error((e as Error).message);
      setSuccess(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer header={{ title: '自提核销' }}>
      {success ? (
        <Result
          status="success"
          title="核销成功"
          subTitle="订单已确认自提"
          extra={
            <Button type="primary" onClick={() => setSuccess(false)}>
              继续核销
            </Button>
          }
        />
      ) : (
        <Space.Compact style={{ maxWidth: 480 }}>
          <Input
            placeholder="输入自提核销码（订单号末 6 位 + 3 位字母数字）"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            size="large"
            onPressEnter={submit}
          />
          <Button
            type="primary"
            size="large"
            loading={submitting}
            onClick={submit}
          >
            核销
          </Button>
        </Space.Compact>
      )}
    </PageContainer>
  );
}
