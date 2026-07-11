/**
 * Dashboard — 实时统计（V0.1.124 接入 stats action）
 */
import { useEffect, useState } from 'react';
import { PageContainer, ProCard, StatisticCard } from '@ant-design/pro-components';
import { App as AntdApp } from 'antd';
import { stats } from '@/services/admin';
import type { StatsResp } from '@/types/admin';

export default function Dashboard() {
  const { message } = AntdApp.useApp();
  const [data, setData] = useState<StatsResp | null>(null);

  useEffect(() => {
    stats()
      .then(setData)
      .catch((e) => message.error((e as Error).message));
  }, []);

  return (
    <PageContainer
      header={{ title: '仪表盘', subTitle: '青沐生命科技 · 大健康生活方式平台' }}
    >
      <ProCard split="vertical">
        <StatisticCard
          statistic={{
            title: '注册用户',
            value: data?.userCount ?? '—',
            description: '总用户数',
          }}
        />
        <StatisticCard
          statistic={{
            title: '订单总数',
            value: data?.orderCount ?? '—',
            description: '所有状态',
          }}
        />
        <StatisticCard
          statistic={{
            title: '已支付收入',
            value: data ? `¥${data.paidRevenue.toFixed(2)}` : '—',
            description: 'paid 订单 payAmount 汇总',
          }}
        />
        <StatisticCard
          statistic={{
            title: '运动打卡',
            value: data?.checkinCount ?? '—',
            description: '总打卡数',
          }}
        />
      </ProCard>
      <ProCard title="管理模块导航" style={{ marginTop: 16 }}>
        <ul>
          <li><strong>商城</strong>：商品分类 / 商品管理 / 订单管理 / 团购管理</li>
          <li><strong>运营</strong>：内容管理 / 评价管理 / 提现管理 / 用户管理 / 自提核销</li>
          <li><strong>系统</strong>：训练计划 / 审计日志</li>
          <li>共 11 个管理模块，覆盖后端 18/27 admin actions</li>
        </ul>
      </ProCard>
    </PageContainer>
  );
}
