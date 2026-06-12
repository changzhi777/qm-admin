/**
 * Login 页
 *
 * 鉴权方案（临时）：
 * 1. Web admin 没法跑 wx.login，临时让用户手工粘贴 JWT token + openid
 * 2. token 来源：用微信开发者工具登录小程序，从 Network 抠 accessToken
 * 3. **真校验**（区别于 V0.1 占位实现）：
 *    a. 写入 token → 后端 me 验证 token 有效性 + 取真实 userId/nickname/avatar
 *    b. listAdmins 验证 openid 在 admin_whitelist 里
 *    c. 任一失败 → 清 token + 提示
 *
 * 后期：扫码登录（小程序扫 admin 二维码 → 后端验 admin → 签 JWT 给 admin）
 */
import { useState } from 'react';
import { Card, Form, Input, Button, Alert, Typography, App as AntdApp } from 'antd';
import { useNavigate, useModel } from '@umijs/max';
import { getMe, listAdmins } from '@/services/auth';
import type { InitialState } from '@/types/app';

const { Title, Paragraph } = Typography;

interface LoginForm {
  token: string;
  openid: string;
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
    const token = values.token.trim();
    const openid = values.openid.trim();
    try {
      // 1. 先写 token（拦截器会自动加 Authorization 头）
      localStorage.setItem('qm_admin_token', token);

      // 2. 验 token 有效性 + 拉真 user（取真 userId，避免 'unknown' 审计断链）
      const meResp = await getMe();
      if (meResp.user.openid !== openid) {
        throw new Error(
          `openid 不匹配：你填的是 ${openid.slice(0, 8)}..., 但 token 解出的是 ${meResp.user.openid.slice(0, 8)}...`,
        );
      }

      // 3. 验 admin 白名单（避免 admin 拒绝后才发现）
      const adminsResp = await listAdmins();
      if (!adminsResp.openids.includes(openid)) {
        throw new Error('该 openid 不在 admin 白名单，请联系运营添加');
      }

      // 4. 全部通过 → 保存真实 user + 进后台
      const user = {
        id: meResp.user.id,
        openid: meResp.user.openid,
        nickname: meResp.user.nickname ?? `admin-${openid.slice(0, 6)}`,
        avatarUrl: meResp.user.avatarUrl,
      };
      localStorage.setItem('qm_admin_user', JSON.stringify(user));
      setInitialState({ token, user, isAdmin: true });
      message.success(`欢迎，${user.nickname}`);
      navigate('/dashboard');
    } catch (e) {
      // 失败：清掉刚写的 token
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
      <Card style={{ width: 480, borderRadius: 8 }}>
        <Title level={3} style={{ textAlign: 'center', color: '#0FAF8E' }}>
          青沐 admin
        </Title>
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message="临时登录方式（V0.2 加固版）"
          description={
            <Paragraph style={{ marginBottom: 0, fontSize: 12 }}>
              手工粘贴小程序登录后的 accessToken + 你的 openid。
              登录时会调 <code>me</code> 验 token 有效性 + 调
              <code> listAdmins</code> 验白名单。
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
