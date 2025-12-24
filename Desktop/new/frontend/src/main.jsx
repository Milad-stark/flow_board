import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from '@/App.jsx'
import TranslationProvider from '@/components/common/TranslationProvider'
import '@/index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

// Get language from localStorage or default to 'fa'
const defaultLanguage = localStorage.getItem('language') || 'fa'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <TranslationProvider language={defaultLanguage}>
        <App />
      </TranslationProvider>
    </QueryClientProvider>
  </React.StrictMode>
) 