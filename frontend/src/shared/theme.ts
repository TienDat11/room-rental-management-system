import type { ThemeConfig } from 'antd';

export const theme: ThemeConfig = {
  token: {
    colorPrimary: '#1677ff',
    borderRadius: 8,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    colorBgContainer: '#ffffff',
    colorBgLayout: '#f5f7fa',
    colorText: '#1f2937',
    colorTextSecondary: '#6b7280',
    colorBorder: '#e5e7eb',
    fontSize: 14,
    lineHeight: 1.5714285714285714,
  },
  components: {
    Button: {
      borderRadius: 8,
      controlHeight: 40,
      paddingInline: 20,
      fontWeight: 500,
    },
    Card: {
      borderRadius: 12,
      paddingLG: 24,
      boxShadowTertiary: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
    },
    Table: {
      borderRadius: 12,
      headerBg: '#f9fafb',
      headerColor: '#374151',
      rowHoverBg: '#f0f7ff',
      borderColor: '#e5e7eb',
    },
    Input: {
      borderRadius: 8,
      controlHeight: 40,
      paddingInline: 12,
    },
    Select: {
      borderRadius: 8,
      controlHeight: 40,
    },
    Menu: {
      itemBg: 'transparent',
      itemHoverBg: '#e6f4ff',
      itemSelectedBg: '#e6f4ff',
      itemSelectedColor: '#1677ff',
      itemBorderRadius: 8,
    },
    Layout: {
      siderBg: '#001529',
      headerBg: '#ffffff',
      bodyBg: '#f5f7fa',
    },
    Statistic: {
      titleFontSize: 14,
      contentFontSize: 28,
    },
    Tag: {
      borderRadius: 6,
    },
    Form: {
      labelColor: '#374151',
      labelFontSize: 14,
    },
    Modal: {
      borderRadius: 12,
    },
  },
};