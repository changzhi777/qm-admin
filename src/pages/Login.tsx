/**
 * Login 页（V0.1.130 账号密码登录，替代手工填 token）
 *
 * 流程：username + password → /api/auth/login method=password → 拿 token + user
 *      → listAdmins 验 openid 在白名单 → 进后台
 *
 * admin User 需先在小程序「账号绑定」页绑 username + 密码（bindApps）
 */
import { useState } from 'react';
import { Card, Form, Input, Button, Alert, Typography, App as AntdApp } from 'antd';
import { useNavigate, useModel } from '@umijs/max';
import { performPasswordLogin } from './login-flow';
import type { InitialState } from '@/types/app';

const { Title, Paragraph } = Typography;

interface LoginForm {
  username: string;
  password: string;
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
      const result = await performPasswordLogin(values);
      if (!result.ok) throw new Error(result.reason);

      localStorage.setItem('qm_admin_token', result.token);
      localStorage.setItem('qm_admin_user', JSON.stringify(result.user));
      setInitialState({ token: result.token, user: result.user, isAdmin: true });
      message.success(`欢迎，${result.user.nickname}`);
      navigate('/dashboard');
    } catch (e) {
      localStorage.removeItem('qm_admin_token');
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
      <Card style={{ width: 420, borderRadius: 8 }}>
        <Title level={3} style={{ textAlign: 'center', color: '#0FAF8E' }}>
          青沐 admin
        </Title>
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message="账号密码登录"
          description={
            <Paragraph style={{ marginBottom: 0, fontSize: 12 }}>
              运营 admin 账号登录。账号需先在小程序「账号绑定」页设置 username + 密码。
            </Paragraph>
          }
        />
        <Form<LoginForm> layout="vertical" onFinish={onFinish}>
          <Form.Item label="账号" name="username" rules={[{ required: true, message: '必填' }]}>
            <Input placeholder="admin 用户名" autoComplete="username" />
          </Form.Item>
          <Form.Item label="密码" name="password" rules={[{ required: true, message: '必填' }]}>
            <Input.Password placeholder="密码" autoComplete="current-password" />
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
