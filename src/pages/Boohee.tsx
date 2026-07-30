/**
 * 薄荷验证中心 — V0.3.35 boohee module 后台验证页
 *
 * 4 个区块端到端验证 /api/boohee 真实数据：
 *   1. 搜索测试 — search 动作
 *   2. 详情测试 — detail 动作（GI/GL/NRV/health_light 完整结构）
 *   3. 批量营养 — batchNutrition 动作
 *   4. 排行榜   — foodRanking 动作
 *
 * 已知限制（V0.3.35）：薄荷免费会员仅开通 search/detail/list 3/7 action，
 * categories/units/ingredients/ranks 等可能返 1101053「权限不足」。
 */
import { useState } from 'react';
import {
  Alert,
  App as AntdApp,
  Button,
  Card,
  Col,
  Descriptions,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import {
  SearchOutlined,
  ThunderboltOutlined,
  TrophyOutlined,
  ExperimentOutlined,
} from '@ant-design/icons';
import {
  searchBoohee,
  getBooheeDetail,
  batchBooheeNutrition,
  getBooheeRanking,
} from '@/services/boohee';
import type { BooheeFoodDetail, BooheeFoodItem } from '@/types/boohee';

const { Text, Title } = Typography;

/** health_light → Tag 颜色 */
const HEALTH_LIGHT_COLOR: Record<number, string> = {
  0: 'default',
  1: 'green',
  2: 'gold',
  3: 'red',
};
const HEALTH_LIGHT_TEXT: Record<number, string> = {
  0: '无评级',
  1: '推荐（绿）',
  2: '适量（黄）',
  3: '少吃（红）',
};

export default function BooheePage() {
  const { message } = AntdApp.useApp();
  return (
    <PageContainer
      header={{
        title: '薄荷验证中心',
        subTitle: 'V0.3.35 boohee module · 端到端验证 4 个核心 action',
      }}
    >
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="当前薄荷 API 仅开通 search/detail/batchNutrition 3/7 权限，排行榜可能返 1101053「权限不足」。失败信息会直接显示在页面帮助排查。"
      />
      <Tabs
        defaultActiveKey="search"
        items={[
          { key: 'search', label: '① 搜索测试', children: <SearchPanel messageApi={message} /> },
          { key: 'detail', label: '② 详情测试', children: <DetailPanel messageApi={message} /> },
          { key: 'batch', label: '③ 批量营养', children: <BatchPanel messageApi={message} /> },
          { key: 'ranking', label: '④ 排行榜', children: <RankingPanel messageApi={message} /> },
        ]}
      />
    </PageContainer>
  );
}

// ===== 1. 搜索测试 =====
type MsgApi = { error: (m: string) => void; success: (m: string) => void; warning: (m: string) => void };
function SearchPanel({ messageApi: message }: { messageApi: MsgApi }) {
  const [keyword, setKeyword] = useState('苹果');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [sort, setSort] = useState<'calorie_asc' | 'calorie_desc' | undefined>();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ list: BooheeFoodItem[]; hasMore: boolean } | null>(null);

  const run = async () => {
    setLoading(true);
    try {
      const resp = await searchBoohee(keyword, { page, perPage, sort });
      setData({ list: resp.list, hasMore: resp.hasMore });
    } catch (e) {
      console.error('boohee error:', (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Space.Compact style={{ marginBottom: 16 }} size="large">
        <Input
          prefix={<SearchOutlined />}
          placeholder="搜索关键词（如 苹果 / 米饭 / 鸡胸肉）"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onPressEnter={run}
          style={{ width: 280 }}
        />
        <InputNumber
          min={1}
          max={50}
          value={perPage}
          onChange={(v) => setPerPage(v ?? 20)}
          prefix="每页"
        />
        <Select
          allowClear
          placeholder="排序"
          value={sort}
          onChange={setSort}
          style={{ width: 160 }}
          options={[
            { value: 'calorie_asc', label: '热量从低到高' },
            { value: 'calorie_desc', label: '热量从高到低' },
          ]}
        />
        <Button type="primary" icon={<SearchOutlined />} loading={loading} onClick={run}>
          搜索
        </Button>
        {data?.list && (
          <Text type="secondary">
            共 {data.list.length} 个 · 还有更多: {data.hasMore ? '是' : '否'}
          </Text>
        )}
      </Space.Compact>
      <Table<BooheeFoodItem>
        rowKey="code"
        dataSource={data?.list ?? []}
        pagination={false}
        size="small"
        columns={[
          {
            title: '食物',
            dataIndex: 'name',
            render: (n: string, r) => (
              <Space>
                <Text strong>{n}</Text>
                <Tag color={HEALTH_LIGHT_COLOR[r.health_light] ?? 'default'}>
                  {HEALTH_LIGHT_TEXT[r.health_light] ?? '-'}
                </Tag>
              </Space>
            ),
          },
          { title: 'Code', dataIndex: 'code', width: 110, render: (v) => <Text code>{v}</Text> },
          { title: '热量 (kcal/100g)', dataIndex: 'calories', width: 130, render: (v) => v.toFixed(1) },
          { title: '蛋白 (g)', dataIndex: 'protein', width: 90, render: (v) => v.toFixed(1) },
          { title: '脂肪 (g)', dataIndex: 'fat', width: 90, render: (v) => v.toFixed(1) },
          { title: '碳水 (g)', dataIndex: 'carbohydrate', width: 90, render: (v) => v.toFixed(1) },
        ]}
      />
    </Card>
  );
}

// ===== 2. 详情测试 =====
function DetailPanel({ messageApi: message }: { messageApi: MsgApi }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BooheeFoodDetail | null>(null);

  const run = async () => {
    if (!code.trim()) {
      return;
    }
    setLoading(true);
    try {
      const resp = await getBooheeDetail(code.trim());
      setData(resp);
    } catch (e) {
      console.error('boohee error:', (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Space.Compact style={{ marginBottom: 16 }}>
        <Input
          prefix={<ExperimentOutlined />}
          placeholder="输入食物 code（搜索页可复制）"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onPressEnter={run}
          style={{ width: 300 }}
        />
        <Button type="primary" icon={<ThunderboltOutlined />} loading={loading} onClick={run}>
          查询详情
        </Button>
      </Space.Compact>

      {data && (
        <>
          <Title level={4} style={{ marginTop: 0 }}>
            {data.name}
            <Tag
              color={HEALTH_LIGHT_COLOR[data.health_light] ?? 'default'}
              style={{ marginLeft: 12 }}
            >
              {HEALTH_LIGHT_TEXT[data.health_light] ?? '-'}
            </Tag>
          </Title>
          <Row gutter={16}>
            <Col span={6}>
              <Statistic
                title="热量"
                value={data.calories.value}
                suffix={`${data.calories.unit_name} · NRV ${data.calories.nrv}%`}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="蛋白质"
                value={data.protein.value}
                suffix={`g · NRV ${data.protein.nrv}%`}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="脂肪"
                value={data.fat.value}
                suffix={`g · NRV ${data.fat.nrv}%`}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="碳水"
                value={data.carbohydrate.value}
                suffix={`g · NRV ${data.carbohydrate.nrv}%`}
              />
            </Col>
          </Row>

          {(data.gi || data.gl) && (
            <Card type="inner" title="血糖反应（薄荷独家）" style={{ marginTop: 16 }}>
              <Row gutter={16}>
                {data.gi && (
                  <Col span={12}>
                    <Statistic
                      title="GI（血糖生成指数）"
                      value={data.gi.value}
                      suffix={data.gi.unit}
                      valueStyle={{
                        color:
                          data.gi.level <= 1
                            ? '#52c41a'
                            : data.gi.level === 2
                            ? '#faad14'
                            : '#f5222d',
                      }}
                    />
                    <Text type="secondary">
                      {data.gi.level <= 1 ? '低 GI（推荐）' : data.gi.level === 2 ? '中 GI' : '高 GI'}
                    </Text>
                  </Col>
                )}
                {data.gl && (
                  <Col span={12}>
                    <Statistic
                      title="GL（血糖负荷）"
                      value={data.gl.value}
                      suffix={data.gl.unit}
                    />
                    <Text type="secondary">
                      {data.gl.level <= 1 ? '低 GL' : data.gl.level === 2 ? '中 GL' : '高 GL'}
                    </Text>
                  </Col>
                )}
              </Row>
            </Card>
          )}

          <Descriptions bordered size="small" column={2} style={{ marginTop: 16 }}>
            <Descriptions.Item label="Code">
              <Text code>{data.code}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="food_type">{data.food_type}</Descriptions.Item>
            <Descriptions.Item label="is_liquid">{String(data.is_liquid)}</Descriptions.Item>
            <Descriptions.Item label="image_url">
              {data.image_url ? (
                <a href={data.image_url} target="_blank" rel="noreferrer">
                  查看
                </a>
              ) : (
                '-'
              )}
            </Descriptions.Item>
            <Descriptions.Item label="ingredients" span={2}>
              {data.ingredients?.length ? data.ingredients.join('、') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="units" span={2}>
              {data.units?.length
                ? data.units
                    .map((u) => `${u.unit_name} (${u.weight}g)`)
                    .join(' / ')
                : '-'}
            </Descriptions.Item>
          </Descriptions>
        </>
      )}
    </Card>
  );
}

// ===== 3. 批量营养 =====
function BatchPanel({ messageApi: message }: { messageApi: MsgApi }) {
  const [codesText, setCodesText] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<unknown[] | null>(null);

  const run = async () => {
    const codes = codesText
      .split(/[,\s\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (codes.length === 0) {
      return;
    }
    setLoading(true);
    try {
      const resp = await batchBooheeNutrition(codes);
      setData(resp.list);
    } catch (e) {
      console.error('boohee error:', (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Input.TextArea
          rows={4}
          placeholder="粘贴多个 food code，逗号或换行分隔（最多 50 个）"
          value={codesText}
          onChange={(e) => setCodesText(e.target.value)}
        />
        <Space>
          <Button type="primary" loading={loading} onClick={run}>
            批量查询
          </Button>
          {data && <Text type="secondary">共 {data.length} 条</Text>}
        </Space>
        <Table
          rowKey={(r) => (r as { code: string }).code}
          dataSource={data ?? []}
          pagination={false}
          size="small"
          columns={[
            { title: 'code', dataIndex: 'code' },
            { title: 'name', dataIndex: 'name' },
            {
              title: 'calories',
              dataIndex: 'calories',
              render: (v) => (v != null ? Number(v).toFixed(1) : '-'),
            },
            {
              title: 'protein',
              dataIndex: 'protein',
              render: (v) => (v != null ? Number(v).toFixed(1) : '-'),
            },
            {
              title: 'fat',
              dataIndex: 'fat',
              render: (v) => (v != null ? Number(v).toFixed(1) : '-'),
            },
            {
              title: 'carbohydrate',
              dataIndex: 'carbohydrate',
              render: (v) => (v != null ? Number(v).toFixed(1) : '-'),
            },
          ]}
        />
      </Space>
    </Card>
  );
}

// ===== 4. 排行榜 =====
function RankingPanel({ messageApi: message }: { messageApi: MsgApi }) {
  const [type, setType] = useState<string | undefined>(undefined);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<unknown[] | null>(null);

  const run = async () => {
    setLoading(true);
    try {
      const resp = await getBooheeRanking({ type, limit });
      setData(resp.list);
    } catch (e) {
      console.error('boohee error:', (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Space style={{ marginBottom: 16 }}>
        <Input
          prefix={<TrophyOutlined />}
          placeholder="type（可选，如 calorie_low）"
          value={type}
          onChange={(e) => setType(e.target.value || undefined)}
          style={{ width: 240 }}
          allowClear
        />
        <InputNumber
          min={1}
          max={100}
          value={limit}
          onChange={(v) => setLimit(v ?? 10)}
          prefix="limit"
        />
        <Button type="primary" loading={loading} onClick={run}>
          查询
        </Button>
        {data && <Text type="secondary">{data.length} 条</Text>}
      </Space>
      <Table
        rowKey={(_, idx) => String(idx)}
        dataSource={data ?? []}
        pagination={false}
        size="small"
        columns={[
          { title: '名称', dataIndex: 'name' },
          {
            title: '热量',
            dataIndex: 'calories',
            render: (v) => (v != null ? Number(v).toFixed(1) : '-'),
          },
          {
            title: 'rank',
            dataIndex: 'rank',
            render: (v) => v ?? '-',
          },
        ]}
      />
    </Card>
  );
}
