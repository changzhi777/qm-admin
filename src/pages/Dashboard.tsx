/**
 * Dashboard — 占位首页
 */
import { PageContainer, ProCard, StatisticCard } from '@ant-design/pro-components';

export default function Dashboard() {
  return (
    <PageContainer
      header={{ title: '仪表盘', subTitle: '青沐生命科技 · 大健康生活方式平台' }}
    >
      <ProCard split="vertical">
        <StatisticCard
          statistic={{
            title: '今日新增订单',
            value: '—',
            description: '接 listOrders 后填入',
          }}
        />
        <StatisticCard
          statistic={{
            title: '今日打卡数',
            value: '—',
            description: 'Phase 4 接 sport.stats',
          }}
        />
        <StatisticCard
          statistic={{
            title: '在线商品',
            value: '—',
            description: '接 listProducts(status=on)',
          }}
        />
      </ProCard>
      <ProCard title="说明" style={{ marginTop: 16 }}>
        <ul>
          <li>左侧菜单进入业务页面（商品分类 / 商品管理 / 订单管理）</li>
          <li>当前仅支持 admin_whitelist 内的 openid 登录</li>
          <li>所有写操作走 POST /api/admin，鉴权头由 token 自动注入</li>
        </ul>
      </ProCard>
    </PageContainer>
  );
}
