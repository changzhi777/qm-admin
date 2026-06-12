/**
 * Login 页 — 临时版本
 *
 * 阶段说明：
 * 1. Web admin 没法跑 wx.login，临时方案 = 手工填 JWT token + openid
 * 2. token 怎么拿：用微信开发者工具登录小程序，在 Network 里抠 accessToken
 * 3. 必须确保 openid 已加入后端 AppConfig.admin_whitelist.openids
 *
 * 后期：扫码登录（小程序扫 admin 二维码 → 后端验证 admin → 签 JWT 给 admin）
 */
import { useState } from 'react';
import { Card, Form, Input, Button, Alert, Typography, App as AntdApp } from 'antd';
import { useNavigate, useModel } from '@umijs/max';
import type { InitialState } from '@/types/app';

const { Title, Paragraph } = Typography;

interface LoginForm {
  token: string;
  openid: string;
  nickname?: string;
}

export default function Login() {
  const navigate = useNavigate();
  const { setInitialState } = useModel('@@initialState') as {
    setInitialState: (s: InitialState) => void;
  };
  const { message } = AntdApp.useApp();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: LoginForm) => {
    setLoading(true);
    try {
      // 写入 localStorage（拦截器会自动加 Authorization 头）
      localStorage.setItem('qm_admin_token', values.token.trim());
      const user = {
        id: 'unknown', // 后端 me 可以查
        openid: values.openid.trim(),
        nickname: values.nickname?.trim() || 'admin',
      };
      localStorage.setItem('qm_admin_user', JSON.stringify(user));
      setInitialState({ token: values.token.trim(), user });
      message.success('登录成功');
      navigate('/dashboard');
    } catch (e) {
      message.error('登录失败：' + (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0FAF8E 0%, #0a8c70 100%)',
      }}
    >
      <Card style={{ width: 480, borderRadius: 8 }}>
        <Title level={3} style={{ textAlign: 'center', color: '#0FAF8E' }}>
          青沐 admin
        </Title>
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message="临时登录方式"
          description={
            <Paragraph style={{ marginBottom: 0, fontSize: 12 }}>
              手工粘贴小程序登录后的 accessToken + 你的 openid。openid 必须在后端
              <code> admin_whitelist </code>里。
            </Paragraph>
          }
        />
        <Form<LoginForm> layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="JWT accessToken"
            name="token"
            rules={[{ required: true, message: '必填' }]}
          >
            <Input.TextArea rows={3} placeholder="eyJhbGciOi..." />
          </Form.Item>
          <Form.Item label="openid" name="openid" rules={[{ required: true, message: '必填' }]}>
            <Input placeholder="oXXXXXXXXXXXXXXXXXX" />
          </Form.Item>
          <Form.Item label="昵称（可选）" name="nickname">
            <Input placeholder="显示用，不传字段会显示 openid 前 8 位" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              进入后台
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
