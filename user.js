/**
 * ユーザーデータの DB 操作を行うモジュール
 * MongoDB へのデータ挿入・取得ロジックを提供する
 */

/**
 * ユーザーを DB に挿入する
 * @param {string} name - ユーザー名
 * @param {number|string} age - 年齢
 * @param {Db} db - MongoDB データベースインスタンス
 * @returns {Promise<{status: number, body: string}>} HTTP ステータスとメッセージ
 */
async function insertUser(name, age, db) {
    // バリデーション: name が未入力の場合
    if (!name) {
        return { status: 400, body: 'Bad Request' };
    }
    // バリデーション: name が文字列でない場合
    if (typeof name !== 'string') {
        return { status: 400, body: 'Bad Request'};
    }
    // バリデーション: name が 100 文字を超える場合
    if (name.length > 100) {
        return { status: 400, body: 'over length'};
    }
    // MongoDB の user コレクションにドキュメントを挿入
    await db.collection('user').insertOne({ name: name, age: age });
    return { status: 200, body: 'Created' };
}

exports.insertUser = insertUser;

/**
 * ユーザー一覧を DB から取得する
 * @param {Db} db - MongoDB データベースインスタンス
 * @param {string} [search] - 検索キーワード（部分一致、省略可）
 * @returns {Promise<{users: Array}>} ユーザーの配列
 */
async function getUsers(db, search) {
    try {
        if (search) {
            // 検索キーワードがある場合: name フィールドで正規表現検索
            // $regex を使用して部分一致検索を行う
            const users = await db.collection('user').find({ name: { $regex: search } }).toArray();
            return { users: users };
        }
        // 検索キーワードがない場合: 全件取得
        // find() で全ドキュメントを取得し、toArray() で配列に変換
        const users = await db.collection('user').find().toArray();
        return { users: users };
    } catch (e) {
        // エラー発生時は空配列を返す
        return  { users: [] };
    }
}

exports.getUsers = getUsers;
