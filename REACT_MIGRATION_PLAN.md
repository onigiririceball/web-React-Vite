# React + Vite フロントエンド移行 作業手順

## 目標アーキテクチャ

```
現在:
  Browser → Express (EJSでHTMLを生成) → MongoDB

目標:
  Browser → React (Vite, localhost:5173) → Express REST API (localhost:3000) → MongoDB
```

EJSを廃止して、Express を純粋な REST API サーバーとして運用し、フロントエンドは React SPA として独立させる。

---

## ステップ 0: 作業前の動作確認

```bash
docker run --rm --name=my-app-db -p 27017:27017 mongo
node index.js
# http://localhost:3000 で現在の動作を確認してから Ctrl+C で停止
```

---

## ステップ 1: バックエンドに `GET /api/users` を追加する

React からデータを JSON で取得するためのエンドポイントを追加する。EJSルートはまだ残しておく。

### `npm install cors`

開発中は Vite(`localhost:5173`) と Express(`localhost:3000`) のポートが違うため CORS が必要。

```bash
npm install cors
```

### `index.js` に追記する内容

```js
const cors = require('cors');

// main() 内、app.use('/static'...) の前後に追加
app.use(cors({ origin: 'http://localhost:5173' }));

// 既存の app.post('/api/user', ...) の前に追加
app.get('/api/users', async (req, res) => {
  const query = req.query.query || '';
  const { users } = await getUsers(db, query);
  res.json(users);
});
```

### 動作確認

```bash
node index.js

# 別ターミナルで
curl http://localhost:3000/api/users
# → JSON配列が返れば成功
curl "http://localhost:3000/api/users?query=太郎"
# → 名前に「太郎」を含むユーザーだけが返れば成功
```

---

## ステップ 2: Vite + React プロジェクトを `client/` に作成する

```bash
# web/ ディレクトリで実行
npm create vite@latest client -- --template react
cd client
npm install
npm run dev
# http://localhost:5173 に Vite のデフォルト画面が表示されれば成功
```

作成後のディレクトリ構成:

```
web/
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── assets/
│   ├── index.html
│   ├── vite.config.js
│   └── package.json   ← client 専用の依存関係（web/ の package.json とは別）
├── index.js
└── ...
```

---

## ステップ 3: Vite のプロキシを設定する

`client/src/` のコードから `/api/users` と書くだけで Express に届くようにする。
CORS の問題もこれで解決するため、ステップ1で追加した `cors` も最終的には不要になる。

### `client/vite.config.js` を書き換える

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
```

---

## ステップ 4: React コンポーネントを実装する

### 作成するファイル構成

```
client/src/
├── main.jsx              # エントリーポイント（変更なし）
├── App.jsx               # state と fetch ロジックの中心
└── components/
    ├── UserForm.jsx      # name・age 入力フォーム
    ├── SearchBox.jsx     # 検索ボックス
    └── UserList.jsx      # ユーザー一覧テーブル（ハイライト付き）
```

### `client/src/App.jsx`

```jsx
import { useState, useEffect } from 'react';
import UserForm from './components/UserForm';
import UserList from './components/UserList';
import SearchBox from './components/SearchBox';

function App() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  const fetchUsers = async (searchQuery = '') => {
    const url = searchQuery
      ? `/api/users?query=${encodeURIComponent(searchQuery)}`
      : '/api/users';
    const res = await fetch(url);
    const data = await res.json();
    setUsers(data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (name, age) => {
    if (!name || !age) {
      setError('name と age は両方入力してください');
      return;
    }
    setError('');
    const res = await fetch('/api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, age }),
    });
    if (res.ok) {
      await fetchUsers(query);
    }
  };

  const handleSearch = (searchQuery) => {
    setQuery(searchQuery);
    fetchUsers(searchQuery);
  };

  return (
    <div>
      <UserForm onSubmit={handleAddUser} error={error} />
      <SearchBox onSearch={handleSearch} />
      <UserList users={users} query={query} />
    </div>
  );
}

export default App;
```

### `client/src/components/UserForm.jsx`

```jsx
import { useState } from 'react';

function UserForm({ onSubmit, error }) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');

  return (
    <div>
      <input
        type="text"
        placeholder="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="text"
        placeholder="age"
        value={age}
        onChange={(e) => setAge(e.target.value)}
      />
      <button onClick={() => onSubmit(name, age)}>送信</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default UserForm;
```

### `client/src/components/SearchBox.jsx`

```jsx
import { useState } from 'react';

function SearchBox({ onSearch }) {
  const [query, setQuery] = useState('');

  return (
    <div>
      <input
        type="text"
        placeholder="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={() => onSearch(query)}>検索</button>
    </div>
  );
}

export default SearchBox;
```

### `client/src/components/UserList.jsx`（ハイライト実装）

EJS でやっていたハイライト処理を React で再実装する。
`dangerouslySetInnerHTML` を使わず、文字列を分割して `<mark>` タグで囲む方が安全。

```jsx
// クエリにマッチした部分を <mark> で囲んで返す
function highlight(text, query) {
  if (!query || !text) return text || '';
  const regex = new RegExp(`(${query})`, 'gi');
  const parts = String(text).split(regex);
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={i}>{part}</mark>
      : part
  );
}

function UserList({ users, query }) {
  return (
    <table>
      <thead>
        <tr>
          <th>name</th>
          <th>age</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user._id}>
            <td>{highlight(user.name, query)}</td>
            <td>{highlight(String(user.age ?? ''), query)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default UserList;
```

> **注意:** MongoDB から来る `age` は数値の場合があるので `String()` で変換する。

### 動作確認

```bash
# terminal 1（web/ で）
node index.js

# terminal 2（client/ で）
npm run dev

# http://localhost:5173 でアプリが動くことを確認
# - ユーザー一覧が表示される
# - フォームからユーザーを追加できる
# - 検索・ハイライトが動く
```

---

## ステップ 5: EJS ルートを削除して API サーバーに純化する

React 側が正常に動いていることを確認したら、`index.js` から EJS 関連を削除する。

### `index.js` から削除するコード

```js
// この2行を削除
app.get('/', async (req, res) => { ... });
app.get('/search', async (req, res) => { ... });

// この1行を削除（EJS設定）
app.set('view engine', 'ejs');

// この1行を削除（静的ファイル配信、不要になる）
app.use('/static', express.static(path.join(__dirname, 'public')));
```

### EJS をアンインストール

```bash
npm uninstall ejs
```

### 動作確認

```bash
node index.js
# http://localhost:3000 には何も返らない（正常）
# http://localhost:5173 でアプリが動いていれば成功
```

---

## ステップ 6: 不要なファイルを削除する

```bash
# web/ ディレクトリで
rm -r views/
rm public/index.js
# public/ も不要なら削除
rm -r public/
```

---

## ステップ 7: 起動スクリプトを整備する

毎回 2 つのターミナルを開くのは不便なので `concurrently` でまとめる。

```bash
# web/ ディレクトリで
npm install --save-dev concurrently
```

### `web/package.json` の scripts を更新

```json
{
  "scripts": {
    "dev": "concurrently \"node index.js\" \"npm run dev --prefix client\"",
    "test": "node --test user.test.js"
  }
}
```

```bash
# web/ ディレクトリで
npm run dev
# Express と Vite が同時に起動する
```

---

## 作業まとめ

| ステップ | 作業内容 | 変更・作成するファイル |
|---|---|---|
| 1 | `GET /api/users` を追加、CORS 設定 | `index.js`、`npm install cors` |
| 2 | Vite + React プロジェクト作成 | `client/` ディレクトリ（新規） |
| 3 | Vite プロキシ設定 | `client/vite.config.js` |
| 4 | React コンポーネント実装 | `client/src/` 以下 |
| 5 | EJS ルートを削除 | `index.js`、`npm uninstall ejs` |
| 6 | 不要ファイルを削除 | `views/`、`public/index.js` |
| 7 | 起動スクリプト整備 | `web/package.json`、`npm install concurrently` |

---

## 最終的なディレクトリ構成

```
web/
├── client/
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   └── components/
│   │       ├── UserForm.jsx
│   │       ├── SearchBox.jsx
│   │       └── UserList.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── index.js          # Express REST API のみ（EJSルートなし）
├── user.js
├── user.test.js
└── package.json
```
