/**
 * App.jsx - アプリケーションのメインコンポーネント
 * ユーザー管理機能の状態管理と各コンポーネントの統合を行う
 */

import { useState, useEffect } from 'react';
import UserForm from './components/UserForm';
import UserList from './components/UserList';
import SearchBox from './components/SearchBox';

function App() {
  // 状態管理
  const [users, setUsers] = useState([]);   // ユーザー一覧データ
  const [query, setQuery] = useState('');   // 検索クエリ
  const [error, setError] = useState('');   // エラーメッセージ

  /**
   * サーバーからユーザー一覧を取得する
   * @param {string} searchQuery - 検索キーワード（省略時は全件取得）
   */
  const fetchUsers = async (searchQuery = '') => {
    // 検索クエリがある場合は URL パラメータに追加
    const url = searchQuery
      ? `/api/users?query=${encodeURIComponent(searchQuery)}`
      : '/api/users';
    const res = await fetch(url);  // API リクエスト
    const data = await res.json(); // JSON をパース
    setUsers(data);                // 状態を更新
  };

  // コンポーネントマウント時に一度だけユーザー一覧を取得
  useEffect(() => {
    fetchUsers();
  }, []); // 空の依存配列 = マウント時のみ実行

  /**
   * 新規ユーザーを追加する
   * @param {string} name - ユーザー名
   * @param {string} age - 年齢
   */
  const handleAddUser = async (name, age) => {
    // バリデーション: 両方の入力が必要
    if (!name || !age) {
      setError('name and age are required');
      return false; // 失敗を返す
    }
    setError(''); // エラーをクリア

    // サーバーに POST リクエストを送信
    const res = await fetch('/api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, age }),
    });

    // 登録成功時、一覧を再取得して自動更新
    if (res.ok) {
      await fetchUsers(query); // 現在の検索状態を維持したまま更新
      return true; // 成功を返す
    }
    return false; // 失敗を返す
  };

  /**
   * ユーザーを検索する
   * @param {string} searchQuery - 検索キーワード
   */
  const handleSearch = (searchQuery) => {
    setQuery(searchQuery);      // 検索クエリを状態に保存
    fetchUsers(searchQuery);    // 検索結果を取得
  };

  return (
    <div>
      {/* ユーザー登録フォーム */}
      <UserForm onSubmit={handleAddUser} error={error} />
      {/* 検索ボックス */}
      <SearchBox onSearch={handleSearch} />
      {/* ユーザー一覧テーブル（検索クエリを渡してハイライト表示） */}
      <UserList users={users} query={query} />
    </div>
  );
}

export default App;
