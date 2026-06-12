/**
 * 商品分类管理 — 只读列表
 *
 * 后端目前只暴露 listCategories（mall.routes.ts），
 * 写操作（增删改分类）走 setConfig 或后续单独建表，先做只读。
 */
import { useState, useEffect } from 'react';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Tag, App as AntdApp } from 'antd';
import { listCategories } from '@/services/mall';
import type { Category } from '@/types/mall';

export default function CategoriesPage() {
  const { message } = AntdApp.useApp();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Category[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const resp = await listCategories();
      setData(resp.list);
    } catch (e) {
      message.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <PageContainer
      header={{ title: '商品分类', subTitle: '只读 · 写入待后端 setConfig 落地' }}
    >
      <ProTable<Category>
        rowKey="id"
        loading={loading}
        dataSource={data}
        search={false}
        pagination={false}
        options={{
          reload: () => void load(),
        }}
        columns={[
          { title: 'ID', dataIndex: 'id', width: 200 },
          { title: '名称', dataIndex: 'name' },
          { title: '排序', dataIndex: 'sort', width: 80 },
          {
            title: '状态',
            dataIndex: 'status',
            width: 100,
            render: (_, r) =>
              r.status === 'on' ? (
                <Tag color="green">上架</Tag>
              ) : (
                <Tag color="red">下架</Tag>
              ),
          },
        ]}
      />
    </PageContainer>
  );
}
