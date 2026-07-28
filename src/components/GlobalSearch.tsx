/**
 * GlobalSearch — 顶部全局搜索（V0.3.5 admin.globalSearch 5 表 LIKE 跨表）
 * 接入 app.tsx layout actionsRender 区
 * - Debounce 300ms
 * - 后端返 5 类型分组（user/feed/comment/interpret/strength）
 */
import { useState } from 'react';
import { AutoComplete, Tag } from 'antd';
import { globalSearch } from '@/services/admin';
import type { GlobalSearchResultItem } from '@/types/admin';

const TYPE_LABEL: Record<string, { label: string; color: string }> = {
  user: { label: '用户', color: 'blue' },
  feed: { label: '动态', color: 'green' },
  comment: { label: '评论', color: 'cyan' },
  interpret: { label: '解读', color: 'purple' },
  strength: { label: '力量', color: 'orange' },
};

/** Debounce 简单实现 */
function debounce<T extends (...args: any[]) => any>(fn: T, ms: number) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

export default function GlobalSearch() {
  const [options, setOptions] = useState<{ value: string; label: React.ReactNode }[]>(
    [],
  );

  const fetchOptions = debounce(async (query: string) => {
    if (!query.trim()) {
      setOptions([]);
      return;
    }
    try {
      const r = await globalSearch({ query, limit: 5 });
      setOptions(
        r.results.map((it: GlobalSearchResultItem) => ({
          value: it.id,
          label: (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Tag color={TYPE_LABEL[it.type]?.color ?? 'default'}>
                {TYPE_LABEL[it.type]?.label ?? it.type}
              </Tag>
              <span style={{ fontWeight: 500 }}>{it.title}</span>
              <span style={{ color: '#999', fontSize: 12, flex: 1 }}>{it.snippet}</span>
            </div>
          ),
        })),
      );
    } catch {
      setOptions([]);
    }
  }, 300);

  return (
    <AutoComplete
      style={{ width: 280 }}
      placeholder="全局搜索（用户/动态/评论/解读/力量）"
      options={options}
      onSearch={(text) => fetchOptions(text)}
      allowClear
      filterOption={false}
    />
  );
}