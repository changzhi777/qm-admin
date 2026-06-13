/**
 * qm-admin vitest 全局 setup
 *
 * - @testing-library/jest-dom matchers：toBeInTheDocument / toHaveTextContent 等
 * - jest-dom 在 happy-dom + jsdom 两种 env 下都工作
 */
import '@testing-library/jest-dom/vitest';
