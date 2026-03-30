/**
 * SearchBox.jsx - 検索ボックスコンポーネント
 * ユーザー名で検索するための入力フィールドと検索ボタンを提供する
 */

import { useState } from 'react';

/**
 * 検索ボックス
 * @param {Object} props
 * @param {Function} props.onSearch - 検索実行時のコールバック関数
 */
function SearchBox({ onSearch }) {
  // 検索クエリの入力値を状態として管理
  const [query, setQuery] = useState('');

  return (
    <div>
      {/* 検索キーワード入力フィールド */}
      <input
        type="text"
        placeholder="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)} // 入力値を状態に反映
      />
      {/* 検索ボタン: クリック時に親コンポーネントの onSearch を呼び出す */}
      <button onClick={() => onSearch(query)}>検索</button>
    </div>
  );
}

export default SearchBox;
