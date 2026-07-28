/**
 * Dashboard — V0.3.4 dashboard 1 API 拉全 9 字段（admin MIS）
 * + V0.2.7 statsByTimeRange 近 7 天趋势
 * 关键范式：「1 API 拉全」避免 N+1，与后端 admin.service.getAdminDashboard 一致
 */
import { useEffect, useState } from 'react';
import { PageContainer, ProCard, StatisticCard } from '@ant-design/pro-components';
import { Table, App as AntdApp, Col, Row } from 'antd';
import { dashboard, statsByTimeRange } from '@/services/admin';
import type { DashboardResp, StatsByTimeRangeItem } from '@/types/admin';

/** 元 → 分 显示 */
const fenToYuan = (fen: number) => `¥${(fen / 100).toFixed(2)}`;

export default function Dashboard() {
  const { message } = AntdApp.useApp();
  const [data, setData] = useState<DashboardResp | null>(null);
  const [range, setRange] = useState<StatsByTimeRangeItem[]>([]);

  useEffect(() => {
    // V0.3.31 fix：加防御性 try/catch 保护 message API
    // 未登录态访问 /dashboard 触发 redirect → /login 时，组件 unmount
    // + React 18 严格模式下 message API 静态方法可能 throw TypeError
    const safeError = (e: unknown) => {
      const msg = e instanceof Error ? e.message : String(e);
      try {
        message?.error?.(msg);
      } catch {
        /* silent — message API 失效时（如 unmount + redirect 时序） */
      }
    };
    dashboard()
      .then(setData)
      .catch(safeError);
    statsByTimeRange({ granularity: 'day' })
      .then((r) => setRange(r.list.slice(-7)))
      .catch(safeError);
  }, []);

  return (
    <PageContainer
      header={{ title: '仪表盘', subTitle: '青沐生命科技 · 大健康生活方式平台 · V0.3.4 MIS' }}
    >
      {/* 用户维度 */}
      <ProCard title="用户" split="vertical" style={{ marginBottom: 16 }}>
        <StatisticCard
          statistic={{ title: '总用户', value: data?.totalUsers ?? '—' }}
        />
        <StatisticCard
          statistic={{
            title: '7 日活跃',
            value: data?.activeUsers7d ?? '—',
            description: 'checkin/weRunRecord/strengthSession 任一',
          }}
        />
      </ProCard>

      {/* 订单维度 */}
      <ProCard title="订单" split="vertical" style={{ marginBottom: 16 }}>
        <StatisticCard
          statistic={{
            title: '订单总数',
            value: data?.totalOrders ?? '—',
            description: '所有状态',
          }}
        />
        <StatisticCard
          statistic={{
            title: '已支付订单',
            value: data?.paidOrders ?? '—',
          }}
        />
        <StatisticCard
          statistic={{
            title: '已支付收入',
            value: data ? fenToYuan(data.totalRevenueFen) : '—',
            description: 'paid 订单 payAmount 汇总（元）',
          }}
        />
      </ProCard>

      {/* 打卡维度 */}
      <ProCard title="运动" split="vertical" style={{ marginBottom: 16 }}>
        <StatisticCard
          statistic={{
            title: '总打卡',
            value: data?.totalCheckins ?? '—',
          }}
        />
        <StatisticCard
          statistic={{
            title: '近 30 天打卡',
            value: data?.checkins30d ?? '—',
          }}
        />
      </ProCard>

      {/* 异常告警 */}
      <ProCard title="告警" split="vertical" style={{ marginBottom: 16 }}>
        <StatisticCard
          statistic={{
            title: '30 天管理员登录失败',
            value: data?.failedAdminLogins30d ?? '—',
            description: '超过 10 需排查安全',
            valueStyle:
              data && data.failedAdminLogins30d > 10
                ? { color: '#cf1322' }
                : undefined,
          }}
        />
        <StatisticCard
          statistic={{
            title: '总解读次数',
            value: data?.totalInterpret ?? '—',
            description: 'minimax M3 / GLM-4.6V',
          }}
        />
      </ProCard>

      {/* 近 7 天趋势 */}
      <ProCard title="近 7 天趋势（statsByTimeRange V0.2.7）" style={{ marginBottom: 16 }}>
        <Table<StatsByTimeRangeItem>
          rowKey="bucket"
          dataSource={range}
          size="small"
          pagination={false}
          columns={[
            { title: '日期', dataIndex: 'bucket' },
            { title: '收入', dataIndex: 'revenue', render: (v) => `¥${v}` },
            { title: '订单数', dataIndex: 'orderCount' },
            { title: '新用户', dataIndex: 'userCount' },
          ]}
        />
      </ProCard>

      {/* 管理模块导航 */}
      <ProCard title="管理模块导航">
        <Row gutter={[16, 8]}>
          <Col span={8}>
            <strong>商城</strong>：商品分类 / 商品管理 / 订单管理 / 团购管理
          </Col>
          <Col span={8}>
            <strong>运营</strong>：内容管理 / 评价管理 / 提现管理 / 用户管理 / 自提核销
          </Col>
          <Col span={8}>
            <strong>系统</strong>：训练计划 / 审计日志 / 配置管理
          </Col>
          <Col span={8}>
            <strong>V0.2.7 新增</strong>：邀请裂变管理 / 上传管理 / 赛事成绩
          </Col>
          <Col span={8}>
            <strong>V0.3.4 新增</strong>：Dashboard MIS 1 API 拉全 9 字段
          </Col>
          <Col span={8}>
            <strong>V0.3.5 新增</strong>：顶部 globalSearch 5 表 LIKE 跨表
          </Col>
          <Col span={24}>
            共 19 个管理模块，覆盖后端 44 个 admin actions（V0.3.4 全对齐）
          </Col>
        </Row>
      </ProCard>
    </PageContainer>
  );
}