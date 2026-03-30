# ユーザー管理アプリ

React + Vite（フロントエンド）と Express + MongoDB（バックエンド）で構成されたユーザー情報管理ツール。

## 仕様

- ユーザー情報（name, age）を管理
- フォームから name と age を入力して送信すると、MongoDB にデータが格納される
- 登録後、自動的に一覧が更新される
- name と age が両方入力されていない場合、エラーメッセージが表示される
- 検索欄にキーワードを入力すると、name が一致するデータのみ表示される
- 検索結果はマッチした文字列がハイライト表示される

## フォルダ構成

```
web/
├── index.js              # Express サーバー（API エンドポイント）
├── user.js               # DB へのデータ挿入・取得ロジック
├── user.test.js          # user.js のテスト
├── package.json          # バックエンド依存関係
├── client/               # React + Vite フロントエンド
│   ├── src/
│   │   ├── App.jsx       # メインコンポーネント
│   │   ├── components/
│   │   │   ├── UserForm.jsx   # ユーザー登録フォーム
│   │   │   ├── UserList.jsx   # ユーザー一覧表示
│   │   │   └── SearchBox.jsx  # 検索ボックス
│   │   ├── main.jsx      # エントリーポイント
│   │   └── *.css         # スタイル
│   ├── vite.config.js    # Vite 設定（API プロキシ含む）
│   └── package.json      # フロントエンド依存関係
└── .github/
    └── workflows/
        └── ci.yml        # GitHub Actions CI 設定
```

## 起動方法

```bash
# 1. MongoDB を Docker で起動
docker run --rm --name=my-app-db -p 27017:27017 mongo

# 2. バックエンド依存関係をインストール（初回のみ）
npm install

# 3. Express サーバーを起動（ポート 3000）
node index.js

# 4. フロントエンド依存関係をインストール（初回のみ）
cd client && npm install

# 5. Vite 開発サーバーを起動（ポート 5173）
npm run dev
```

ブラウザで http://localhost:5173 にアクセス。

## テスト実行

```bash
node --test user.test.js
```

## 今後取り組むこと

1. ~~React + Vite を使用して現時点で実際に多く採用されている仕様に近づける~~ 
2. ~~登録後に自動更新できるように UX 改善~~ 
3. React コンポーネントのテスト
4. テスト改善: 異常系と境界値を増やす
5. ログの追加
6. service 層と controller 層で分ける
7. 新しくレポジトリを作成してUdemyでReactを学ぶ (~/project/UdemyReact)
