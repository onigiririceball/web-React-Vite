/**
 * サーバーのエントリーポイント
 * Express フレームワークを使用して REST API を提供する
 * MongoDB に接続し、ユーザーデータの CRUD 操作を行う
 */

const express = require('express'); // Express: Node.js の Web フレームワーク
const { MongoClient } = require('mongodb'); // MongoDB クライアント
const path = require('path'); // パス操作ユーティリティ（OS 間の互換性確保）
const { insertUser, getUsers } = require('./user'); // DB 操作関数
const cors = require('cors'); // CORS: 異なるオリジンからのリクエストを許可

const app = express(); // Express アプリケーションインスタンスを作成
const client = new MongoClient('mongodb://localhost:27017'); // MongoDB 接続設定

// CORS 設定: Vite 開発サーバー（ポート 5173）からのアクセスを許可
app.use(cors({ origin: 'http://localhost:5173' }));

/**
 * メイン関数
 * MongoDB に接続し、API エンドポイントを設定してサーバーを起動する
 */
async function main() {
  // MongoDB に接続（非同期処理なので await で完了を待つ）
  // 接続が完了してからサーバーを起動することで、
  // クライアントがアクセス時に DB が利用可能であることを保証する
  await client.connect();

  // 使用するデータベースを選択
  const db = client.db('my-app');

  /**
   * GET /api/users
   * ユーザー一覧を取得する API
   * クエリパラメータ query で名前検索が可能
   */
  app.get('/api/users', async (req, res) => {
    const query = req.query.query || ''; // 検索クエリ（未指定時は空文字）
    const { users } = await getUsers(db, query); // DB からユーザーを取得
    res.json(users); // JSON 形式でレスポンス
  });

  /**
   * POST /api/user
   * 新規ユーザーを登録する API
   * リクエストボディに name と age を含める
   */
  app.post('/api/user', express.json(), async (req, res) => {
    const name = req.body.name; // リクエストボディから name を取得
    const age = req.body.age;   // リクエストボディから age を取得
    const { status, body } = await insertUser(name, age, db); // DB に挿入
    res.status(status).send(body); // ステータスコードとメッセージを返す
  });

  // サーバーをポート 3000 で起動
  app.listen(3000, () => {
    console.log('start listening');
  });
}

// アプリケーション起動
main();
