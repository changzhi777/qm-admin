/**
 * qm-admin RTL 框架冒烟测试
 *
 * 验证：
 * - jsdom env 跑通
 * - @testing-library/jest-dom matchers 工作（toBeInTheDocument 等）
 * - antd Button 渲染 + click 事件
 *
 * 注：复杂组件（ProTable / Modal）测试 ROI 低（antd + Umi Max mock 成本高），
 * 后续按需补具体业务组件测试。当前这 1 个冒烟足够验证 RTL 基建。
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from 'antd';

describe('qm-admin RTL 框架冒烟（jsdom env）', () => {
  // antd 5 在中文按钮 accessible name 中间会插空格（"提交" → "提 交"），
  // 直接用 role+name regex 不可靠。改用 button[textContent] 查找。
  function findButtonByText(text: string): HTMLElement {
    const buttons = screen.getAllByRole('button');
    const found = buttons.find((b) => (b.textContent ?? '').replace(/\s/g, '') === text);
    if (!found) throw new Error(`button with text "${text}" not found in ${buttons.length} buttons`);
    return found;
  }

  it('antd Button 渲染 + 显示文案', () => {
    render(<Button type="primary">点击退款</Button>);
    const btn = findButtonByText('点击退款');
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveTextContent('点击退款');
  });

  it('antd Button 点击触发 onClick', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>提交</Button>);
    const btn = findButtonByText('提交');
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('disabled 按钮不触发 onClick', () => {
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>禁用</Button>);
    const btn = findButtonByText('禁用');
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('jest-dom matchers：toHaveClass 生效', () => {
    render(<Button danger className="test-cls">危险</Button>);
    const btn = findButtonByText('危险');
    expect(btn).toHaveClass('ant-btn-dangerous');
    expect(btn.className).toContain('test-cls');
  });
});
