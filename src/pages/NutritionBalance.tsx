/**
 * 用户营养 × 运动平衡 5 步向导 — V0.3.35
 *
 * 演示 V0.3.35 boohee API 落地场景：选用户 → 查运动消耗 → 查饮食摄入 → 加 boohee 食物回填 → 平衡报告。
 * 这是 admin 验证 boohee 真实业务价值（不是 dry-run）的最佳演示。
 *
 * 5 步：
 * 1. 选用户（listUsers，搜索）
 * 2. 运动消耗（nutritionBalance.sport，StatisticCard + Recharts 简表）
 * 3. 饮食摄入（meals 列表，booheeEnriched Tag 区分）
 * 4. 加食物回填（searchBoohee → batchBooheeNutrition，弹 Modal）
 * 5. 平衡报告（净卡路里 + Recharts Radar 营养雷达 + recommendation）
 */
import { useState } from 'react';
import {
  Alert,
  App as AntdApp,
  Button,
  Card,
  Col,
  Empty,
  Input,
  List,
  Modal,
  Row,
  Select,
  Space,
  Statistic,
  Steps,
  Table,
  Tag,
  Typography,
} from 'antd';
import {
  AimOutlined,
  CoffeeOutlined,
  FireOutlined,
  RocketOutlined,
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { listUsers } from '@/services/admin/user';
import { getNutritionBalance } from '@/services/admin/dashboard';
import { searchBoohee, batchBooheeNutrition } from '@/services/boohee';
import type { NutritionBalanceResp } from '@/types/admin';
import type { BooheeFoodItem, BooheeBatchItem } from '@/types/boohee';

const { Text } = Typography;

interface UserLite {
  id: string;
  nickname: string | null;
  phone: string | null;
}

const HEALTH_LIGHT_COLOR: Record<number, string> = {
  0: 'default',
  1: 'green',
  2: 'gold',
  3: 'red',
};
const HEALTH_LIGHT_TEXT: Record<number, string> = {
  0: '无',
  1: '绿',
  2: '黄',
  3: '红',
};

export default function NutritionBalancePage() {
  return (
    <PageContainer
      header={{
        title: '用户营养 × 运动平衡',
        subTitle: 'V0.3.35 boohee×运动数据结合 · 5 步向导',
      }}
    >
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="本页面调用 admin.nutritionBalance（后端 4 段独立 try/catch 范式聚合 Checkin / DeviceDailyActivity / food.myMeals / boohee.search+detail）。任一段失败不挂主流程，boohee 失败时 meals item 标 booheeEnriched: false。"
      />
      <NutritionBalanceWizard />
    </PageContainer>
  );
}

function NutritionBalanceWizard() {
  const { message } = AntdApp.useApp();
  const [step, setStep] = useState(0);
  const [selectedUser, setSelectedUser] = useState<UserLite | null>(null);
  const [balanceData, setBalanceData] = useState<NutritionBalanceResp | null>(null);
  const [loading, setLoading] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  // ===== Step 2 触发 =====
  const loadBalance = async (userId: string) => {
    setLoading(true);
    try {
      const resp = await getNutritionBalance({ userId });
      setBalanceData(resp);
      setStep(1); // 进入 Step 2
    } catch (e) {
      message.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Steps
        current={step}
        items={[
          { title: '选用户', icon: <UserOutlined /> },
          { title: '运动消耗', icon: <FireOutlined /> },
          { title: '饮食摄入', icon: <CoffeeOutlined /> },
          { title: '加食物回填', icon: <SearchOutlined /> },
          { title: '平衡报告', icon: <AimOutlined /> },
        ]}
        style={{ marginBottom: 24 }}
      />

      {step === 0 && <Step1SelectUser onSelect={(u) => { setSelectedUser(u); loadBalance(u.id); }} loading={loading} />}

      {step >= 1 && balanceData && selectedUser && (
        <>
          <Card
            size="small"
            style={{ marginBottom: 16 }}
            title={`已选用户：${selectedUser.nickname ?? selectedUser.phone ?? selectedUser.id.slice(0, 8)}`}
            extra={
              <Space>
                <Text type="secondary">日期：{balanceData.date}</Text>
                <Button size="small" onClick={() => { setStep(0); setBalanceData(null); }}>
                  重新选择
                </Button>
              </Space>
            }
          />
          {step === 1 && <Step2Sport data={balanceData} onNext={() => setStep(2)} />}
          {step === 2 && (
            <Step3Meals
              data={balanceData}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <Step4AddFood
              data={balanceData}
              open={addOpen}
              setOpen={setAddOpen}
              onReload={async () => {
                await loadBalance(selectedUser.id);
              }}
              onNext={() => setStep(4)}
              onBack={() => setStep(2)}
            />
          )}
          {step === 4 && <Step5Report data={balanceData} onBack={() => setStep(3)} onRestart={() => { setStep(0); setBalanceData(null); setSelectedUser(null); }} />}
        </>
      )}
    </>
  );
}

// ===== Step 1：选用户 =====
function Step1SelectUser({
  onSelect,
  loading,
}: {
  onSelect: (u: UserLite) => void;
  loading: boolean;
}) {
  const { message } = AntdApp.useApp();
  const [keyword, setKeyword] = useState('');
  const [users, setUsers] = useState<UserLite[]>([]);
  const [searching, setSearching] = useState(false);

  const doSearch = async () => {
    setSearching(true);
    try {
      const resp = await listUsers({ keyword, page: 1, pageSize: 20 });
      setUsers(
        resp.list.map((u) => ({
          id: u.id,
          nickname: u.nickname,
          phone: u.phone,
        })),
      );
    } catch (e) {
      message.error((e as Error).message);
    } finally {
      setSearching(false);
    }
  };

  return (
    <Card title="搜索用户" size="small">
      <Space.Compact style={{ width: '100%', marginBottom: 16 }}>
        <Input
          prefix={<SearchOutlined />}
          placeholder="昵称/手机号/openid 关键词"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onPressEnter={doSearch}
          size="large"
        />
        <Button type="primary" size="large" loading={searching} onClick={doSearch}>
          搜索
        </Button>
      </Space.Compact>
      {loading && <Text type="secondary">正在拉取用户数据...</Text>}
      <List
        dataSource={users}
        locale={{ emptyText: '搜索后选择用户' }}
        renderItem={(u) => (
          <List.Item
            actions={[
              <Button key="s" type="link" onClick={() => onSelect(u)}>
                选择 →
              </Button>,
            ]}
          >
            <List.Item.Meta
              title={u.nickname ?? '(无昵称)'}
              description={u.phone ?? u.id}
            />
          </List.Item>
        )}
      />
    </Card>
  );
}

// ===== Step 2：运动消耗 =====
function Step2Sport({ data, onNext }: { data: NutritionBalanceResp; onNext: () => void }) {
  const chartData = [
    { name: 'Checkin 距离', value: data.sport.totalDistanceKm, unit: 'km' },
    { name: 'Device 卡路里', value: data.sport.caloriesBurned - data.sport.totalDistanceKm * 60, unit: 'kcal' },
  ];

  return (
    <Card
      title="今日运动消耗"
      size="small"
      extra={<Button type="primary" onClick={onNext}>下一步：饮食摄入 →</Button>}
    >
      <Row gutter={16}>
        <Col span={6}>
          <Statistic title="总卡路里消耗" value={data.sport.caloriesBurned} suffix="kcal" valueStyle={{ color: '#2D9D78' }} />
        </Col>
        <Col span={6}>
          <Statistic title="跑步距离" value={data.sport.totalDistanceKm} suffix="km" />
        </Col>
        <Col span={6}>
          <Statistic title="打卡次数" value={data.sport.checkinCount} suffix="次" />
        </Col>
        <Col span={6}>
          <Statistic title="步数" value={data.sport.steps} suffix="步" />
        </Col>
      </Row>
      <div style={{ marginTop: 16 }}>
        <Tag color="blue">数据源：{data.sport.source}</Tag>
        {data.sport.source === 'none' && (
          <Text type="warning">该用户今日无运动数据，建议先让其打一次卡。</Text>
        )}
      </div>
      {data.sport.caloriesBurned > 0 && (
        <div style={{ height: 220, marginTop: 16 }}>
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#2D9D78" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}

// ===== Step 3：饮食摄入 =====
function Step3Meals({
  data,
  onNext,
  onBack,
}: {
  data: NutritionBalanceResp;
  onNext: () => void;
  onBack: () => void;
}) {
  const enrichedCount = data.meals.reduce((s, m) => s + m.items.filter((i) => i.booheeEnriched).length, 0);
  const totalCount = data.meals.reduce((s, m) => s + m.items.length, 0);

  return (
    <Card
      title="今日饮食摄入"
      size="small"
      extra={
        <Space>
          <Button onClick={onBack}>← 上一步</Button>
          <Button type="primary" onClick={onNext}>下一步：加食物回填 →</Button>
        </Space>
      }
    >
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Statistic title="总卡路里摄入" value={data.totalIntake.calorie} suffix="kcal" valueStyle={{ color: '#fa8c16' }} />
        </Col>
        <Col span={6}>
          <Statistic title="蛋白质" value={data.totalIntake.protein} suffix="g" />
        </Col>
        <Col span={6}>
          <Statistic title="脂肪" value={data.totalIntake.fat} suffix="g" />
        </Col>
        <Col span={6}>
          <Statistic title="碳水" value={data.totalIntake.carb} suffix="g" />
        </Col>
      </Row>
      <Text type="secondary">
        boohee 营养回填：{enrichedCount}/{totalCount} 项
      </Text>
      <Table
        size="small"
        rowKey={(r) => r.id}
        dataSource={data.meals}
        pagination={false}
        style={{ marginTop: 12 }}
        columns={[
          { title: '餐次', dataIndex: 'mealType', width: 80, render: (t: string) => <Tag color="blue">{t}</Tag> },
          {
            title: '食物',
            dataIndex: 'items',
            render: (items: Array<{ name: string; calorie: number; booheeEnriched?: boolean; gi?: number; healthLight?: number }>) => (
              <Space direction="vertical" size={4}>
                {items.map((it, i) => (
                  <Space key={i} size={4}>
                    <Text>{it.name}</Text>
                    <Text type="secondary">{it.calorie} kcal</Text>
                    {it.booheeEnriched ? (
                      <Tag color="green" title={`GI ${it.gi ?? '-'} / GL ${(it as { gl?: number }).gl ?? '-'} / HL ${HEALTH_LIGHT_TEXT[it.healthLight ?? 0]}`}>
                        ✓ boohee
                      </Tag>
                    ) : (
                      <Tag>未回填</Tag>
                    )}
                  </Space>
                ))}
              </Space>
            ),
          },
          { title: '总卡路里', dataIndex: 'totalCalorie', width: 100, render: (v: number) => `${v} kcal` },
        ]}
      />
    </Card>
  );
}

// ===== Step 4：加食物回填 =====
function Step4AddFood({
  data,
  open,
  setOpen,
  onReload,
  onNext,
  onBack,
}: {
  data: NutritionBalanceResp;
  open: boolean;
  setOpen: (b: boolean) => void;
  onReload: () => Promise<void>;
  onNext: () => void;
  onBack: () => void;
}) {
  const { message } = AntdApp.useApp();
  const [keyword, setKeyword] = useState('');
  const [searchResult, setSearchResult] = useState<BooheeFoodItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [batchResult, setBatchResult] = useState<BooheeBatchItem[] | null>(null);

  const doSearch = async () => {
    if (!keyword.trim()) {
      message.warning('请输入搜索词');
      return;
    }
    setSearching(true);
    try {
      const resp = await searchBoohee(keyword, { perPage: 10 });
      setSearchResult(resp.list);
      if (resp.list.length === 0) message.info('薄荷无结果');
    } catch (e) {
      message.error((e as Error).message);
    } finally {
      setSearching(false);
    }
  };

  const doBatch = async () => {
    const codes = searchResult.map((f) => f.code);
    if (codes.length === 0) return;
    try {
      const resp = await batchBooheeNutrition(codes);
      setBatchResult(resp.list);
      message.success(`批量返回 ${resp.list.length} 条`);
    } catch (e) {
      message.error((e as Error).message);
    }
  };

  return (
    <Card
      title="加食物回填（演示 boohee API 落地）"
      size="small"
      extra={
        <Space>
          <Button onClick={onBack}>← 上一步</Button>
          <Button onClick={onReload}>刷新当前 balance</Button>
          <Button type="primary" onClick={onNext}>下一步：平衡报告 →</Button>
        </Space>
      }
    >
      <Text>
        提示：本页演示 V0.3.35 boohee API 真实调用（<Text code>searchBoohee</Text> + <Text code>batchBooheeNutrition</Text>）。返回的 GI/GL/NRV 可在第 2 批 + 下次部署时回填到 nutritionBalance.meals.items。
      </Text>
      <Button
        type="primary"
        icon={<SearchOutlined />}
        style={{ marginTop: 16 }}
        onClick={() => setOpen(true)}
      >
        打开 boohee 食物搜索弹层
      </Button>

      <Modal
        open={open}
        title="boohee 食物搜索（V0.3.35）"
        onCancel={() => setOpen(false)}
        footer={null}
        width={720}
      >
        <Space.Compact style={{ width: '100%', marginBottom: 12 }}>
          <Input
            prefix={<SearchOutlined />}
            placeholder="食物名（如 鸡胸肉 / 苹果）"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={doSearch}
          />
          <Button type="primary" loading={searching} onClick={doSearch}>
            搜索
          </Button>
          <Button onClick={doBatch} disabled={searchResult.length === 0}>
            批量回填
          </Button>
        </Space.Compact>

        {batchResult && batchResult.length > 0 ? (
          <Table
            size="small"
            rowKey={(r) => r.code}
            dataSource={batchResult}
            pagination={false}
            columns={[
              { title: 'code', dataIndex: 'code' },
              { title: 'name', dataIndex: 'name' },
              { title: 'calories', dataIndex: 'calories', render: (v) => v ?? '-' },
              { title: 'protein', dataIndex: 'protein', render: (v) => v ?? '-' },
              { title: 'fat', dataIndex: 'fat', render: (v) => v ?? '-' },
              { title: 'carbohydrate', dataIndex: 'carbohydrate', render: (v) => v ?? '-' },
            ]}
          />
        ) : searchResult.length > 0 ? (
          <Table
            size="small"
            rowKey={(r) => r.code}
            dataSource={searchResult}
            pagination={false}
            columns={[
              { title: 'name', dataIndex: 'name' },
              { title: 'code', dataIndex: 'code' },
              { title: 'calories', dataIndex: 'calories', render: (v) => v.toFixed(1) },
              {
                title: 'health_light',
                dataIndex: 'healthLight',
                render: (v: number) => (
                  <Tag color={HEALTH_LIGHT_COLOR[v] ?? 'default'}>{HEALTH_LIGHT_TEXT[v] ?? v}</Tag>
                ),
              },
            ]}
          />
        ) : (
          <Empty description="搜索后展示结果" />
        )}
      </Modal>
    </Card>
  );
}

// ===== Step 5：平衡报告 =====
function Step5Report({
  data,
  onBack,
  onRestart,
}: {
  data: NutritionBalanceResp;
  onBack: () => void;
  onRestart: () => void;
}) {
  const radarData = [
    { axis: '卡路里', value: data.totalIntake.calorie },
    { axis: '蛋白', value: data.totalIntake.protein },
    { axis: '脂肪', value: data.totalIntake.fat },
    { axis: '碳水', value: data.totalIntake.carb },
    { axis: '消耗', value: data.sport.caloriesBurned },
  ];

  const balanceColor = data.netBalance.calorie < 0 ? '#52c41a' : data.netBalance.calorie > 0 ? '#f5222d' : '#2D9D78';

  return (
    <Card
      title={
        <Space>
          <RocketOutlined />
          平衡报告
        </Space>
      }
      size="small"
      extra={
        <Space>
          <Button onClick={onBack}>← 上一步</Button>
          <Button type="primary" onClick={onRestart}>重新查询</Button>
        </Space>
      }
    >
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic title="摄入" value={data.totalIntake.calorie} suffix="kcal" valueStyle={{ color: '#fa8c16' }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="消耗" value={data.sport.caloriesBurned} suffix="kcal" valueStyle={{ color: '#2D9D78' }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="净平衡"
              value={data.netBalance.calorie}
              suffix="kcal"
              valueStyle={{ color: balanceColor, fontSize: 32, fontWeight: 600 }}
            />
          </Card>
        </Col>
      </Row>

      <div style={{ height: 360 }}>
        <ResponsiveContainer>
          <RadarChart data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="axis" />
            <PolarRadiusAxis />
            <Radar name="营养" dataKey="value" stroke="#2D9D78" fill="#2D9D78" fillOpacity={0.4} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <Card type="inner" style={{ marginTop: 16 }} title="健康建议">
        <Text style={{ fontSize: 16 }}>{data.netBalance.recommendation}</Text>
      </Card>
    </Card>
  );
}
