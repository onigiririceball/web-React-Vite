/**
 * vite.config.js - Vite 設定ファイル
 * ビルドツールの設定とプロキシ設定を行う
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // プラグイン設定: React サポートを有効化
  plugins: [react()],

  // 開発サーバー設定
  server: {
    // プロキシ設定
    // /api で始まるリクエストを Express サーバー（ポート 3000）に転送
    // これにより、フロントエンド（5173）とバックエンド（3000）間の
    // CORS 問題を回避し、同一オリジンのように API を呼び出せる
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
