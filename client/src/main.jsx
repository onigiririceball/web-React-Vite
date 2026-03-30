/**
 * main.jsx - React アプリケーションのエントリーポイント
 * アプリを DOM にマウントする
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'  // グローバルスタイルをインポート
import App from './App.jsx'  // メインコンポーネント

// React アプリケーションを DOM にマウント
// document.getElementById('root') で index.html 内の <div id="root"> を取得
createRoot(document.getElementById('root')).render(
  // StrictMode: 開発時に潜在的な問題を検出するためのラッパー
  // - 非推奨の API 使用を警告
  // - 副作用の検出のためコンポーネントを2回レンダリング
  <StrictMode>
    <App />
  </StrictMode>,
)
