/**
 * Dashboard — 实时统计（V0.1.124 stats）+ 近 7 天趋势（V0.2.7 statsByTimeRange）
 */
import { useEffect, useState } from 'react';
import { PageContainer, ProCard, StatisticCard } from '@ant-design/pro-components';
import { Table, App as AntdApp } from 'antd';
import { stats, statsByTimeRange } from '@/services/admin';
import type { StatsResp, StatsByTimeRangeItem } from '@/types/admin';

export default function Dashboard() {
  const { message } = AntdApp.useApp();
  const [data, setData] = useState<StatsResp | null>(null);
  const [range, setRange] = useState<StatsByTimeRangeItem[]>([]);

  useEffect(() => {
    stats()
      .then(setData)
      .catch((e) => message.error((e as Error).message));
    statsByTimeRange({ granularity: 'day' })
      .then((r) => setRange(r.list.slice(-7)))
      .catch((e) => message.error((e as Error).message));
  }, []);

  return (
    <PageContainer
      header={{ title: '仪表盘', subTitle: '青沐生命科技 · 大健康生活方式平台' }}
    >
      <ProCard split="vertical">
        <StatisticCard
          statistic={{ title: '注册用户', value: data?.userCount ?? '—', description: '总用户数' }}
        />
        <StatisticCard
          statistic={{ title: '订单总数', value: data?.orderCount ?? '—', description: '所有状态' }}
        />
        <StatisticCard
          statistic={{
            title: '已支付收入',
            value: data ? `¥${data.paidRevenue.toFixed(2)}` : '—',
            description: 'paid 订单 payAmount 汇总',
          }}
        />
        <StatisticCard
          statistic={{ title: '运动打卡', value: data?.checkinCount ?? '—', description: '总打卡数' }}
        />
      </ProCard>

      <ProCard title="近 7 天趋势（statsByTimeRange V0.2.7）" style={{ marginTop: 16 }}>
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

      <ProCard title="管理模块导航" style={{ marginTop: 16 }}>
        <ul>
          <li><strong>商城</strong>：商品分类 / 商品管理 / 订单管理 / 团购管理</li>
          <li><strong>运营</strong>：内容管理 / 评价管理 / 提现管理 / 用户管理 / 自提核销</li>
          <li><strong>系统</strong>：训练计划 / 审计日志 / 配置管理</li>
          <li><strong>V0.2.7 新增</strong>：邀请裂变管理 / 上传管理 / 赛事成绩</li>
          <li>共 17 个管理模块，覆盖后端 27+ admin actions（V0.2.7 对齐）</li>
        </ul>
      </ProCard>
    </PageContainer>
  );
}
