/**
 * UserForm.jsx - ユーザー登録フォームコンポーネント
 * name と age の入力フィールドと送信ボタンを提供する
 */

import { useState } from 'react';

/**
 * ユーザー登録フォーム
 * @param {Object} props
 * @param {Function} props.onSubmit - フォーム送信時のコールバック関数
 * @param {string} props.error - 表示するエラーメッセージ
 */
function UserForm({ onSubmit, error }) {
  // フォームの入力値を状態として管理
  const [name, setName] = useState(''); // 名前の入力値
  const [age, setAge] = useState('');   // 年齢の入力値

  return (
    <div>
      {/* 名前入力フィールド */}
      <input
        type="text"
        placeholder="name"
        value={name}
        onChange={(e) => setName(e.target.value)} // 入力値を状態に反映
      />
      {/* 年齢入力フィールド */}
      <input
        type="text"
        placeholder="age"
        value={age}
        onChange={(e) => setAge(e.target.value)} // 入力値を状態に反映
      />
      {/* 送信ボタン: クリック時に親コンポーネントの onSubmit を呼び出す */}
      <button onClick={async () => {
        const success = await onSubmit(name, age);
        // 送信成功時のみフォームをクリア
        if (success) {
          setName('');
          setAge('');
        }
      }}>送信</button>
      {/* エラーメッセージがある場合のみ表示 */}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default UserForm;
