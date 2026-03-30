import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserForm from './UserForm';

describe('UserForm', () => {
  test('名前と年齢を入力して送信できる', async () => {
    const onSubmit = vi.fn().mockResolvedValue(true);
    render(<UserForm onSubmit={onSubmit} error="" />);

    // 入力フィールドに値を入力
    fireEvent.change(screen.getByPlaceholderText('name'), {
      target: { value: 'テスト太郎' },
    });
    fireEvent.change(screen.getByPlaceholderText('age'), {
      target: { value: '25' },
    });

    // 送信ボタンをクリック
    fireEvent.click(screen.getByText('送信'));

    // onSubmitが正しい引数で呼ばれることを確認
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith('テスト太郎', '25');
    });
  });

  test('送信成功時にフォームがクリアされる', async () => {
    const onSubmit = vi.fn().mockResolvedValue(true);
    render(<UserForm onSubmit={onSubmit} error="" />);

    const nameInput = screen.getByPlaceholderText('name');
    const ageInput = screen.getByPlaceholderText('age');

    fireEvent.change(nameInput, { target: { value: 'テスト太郎' } });
    fireEvent.change(ageInput, { target: { value: '25' } });
    fireEvent.click(screen.getByText('送信'));

    // フォームがクリアされることを確認
    await waitFor(() => {
      expect(nameInput.value).toBe('');
      expect(ageInput.value).toBe('');
    });
  });

  test('エラーメッセージが表示される', () => {
    render(<UserForm onSubmit={vi.fn()} error="name and age are required" />);

    expect(screen.getByText('name and age are required')).toBeInTheDocument();
  });

  test('エラーがない場合はエラーメッセージが表示されない', () => {
    render(<UserForm onSubmit={vi.fn()} error="" />);

    expect(screen.queryByText('name and age are required')).not.toBeInTheDocument();
  });
});
