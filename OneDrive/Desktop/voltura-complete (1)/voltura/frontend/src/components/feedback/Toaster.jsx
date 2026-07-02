import { Toaster as HotToaster } from 'react-hot-toast';

export default function Toaster() {
  return (
    <HotToaster
      position="top-right"
      gutter={10}
      toastOptions={{
        duration: 4000,
        style: {
          background: 'rgb(var(--surface-overlay))',
          color: 'rgb(var(--ink))',
          border: '1px solid rgb(var(--border))',
          borderRadius: '14px',
          fontSize: '13.5px',
          fontFamily: '"Lexend", sans-serif',
          boxShadow: '0 4px 12px -2px rgb(15 23 42 / 0.10), 0 12px 32px -8px rgb(15 23 42 / 0.10)',
          padding: '12px 14px',
        },
        success: { iconTheme: { primary: '#16B566', secondary: 'white' } },
        error: { iconTheme: { primary: '#EF4444', secondary: 'white' } },
      }}
    />
  );
}
