/**
 * UserList.jsx - ユーザー一覧表示コンポーネント
 * ユーザーデータをテーブル形式で表示し、検索キーワードをハイライトする
 */

/**
 * テキスト内の検索キーワードを <mark> タグで囲んでハイライト表示する
 * @param {string} text - 対象テキスト
 * @param {string} query - 検索キーワード
 * @returns {Array|string} ハイライト処理済みの React 要素配列
 */
function highlight(text, query) {
  // クエリまたはテキストが空の場合はそのまま返す
  if (!query || !text) return text || '';

  // 検索キーワードで正規表現を作成（大文字小文字を区別しない）
  const regex = new RegExp(`(${query})`, 'gi');

  // テキストを検索キーワードで分割
  const parts = String(text).split(regex);

  // 各パートを処理: マッチした部分は <mark> で囲む
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={i}>{part}</mark>  // マッチした部分をハイライト
      : part                          // それ以外はそのまま
  );
}

/**
 * ユーザー一覧テーブル
 * @param {Object} props
 * @param {Array} props.users - ユーザーデータの配列
 * @param {string} props.query - 検索キーワード（ハイライト用）
 */
function UserList({ users, query }) {
  return (
    <table>
      {/* テーブルヘッダー */}
      <thead>
        <tr>
          <th>name</th>
          <th>age</th>
        </tr>
      </thead>
      {/* テーブルボディ: ユーザーデータを行として表示 */}
      <tbody>
        {users.map((user) => (
          // MongoDB の _id をキーとして使用
          <tr key={user._id}>
            {/* 名前（検索キーワードをハイライト） */}
            <td>{highlight(user.name, query)}</td>
            {/* 年齢（null/undefined の場合は空文字に変換） */}
            <td>{highlight(String(user.age ?? ''), query)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default UserList;
