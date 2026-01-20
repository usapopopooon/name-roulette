# 変更履歴

このプロジェクトの主な変更点を記録します。

フォーマットは [Keep a Changelog](https://keepachangelog.com/ja/1.1.0/) に基づいており、
[Semantic Versioning](https://semver.org/lang/ja/) に準拠しています。

## [0.0.2] - 2026-01-20

### 修正

- ルーレット当選者判定のバグを修正（矢印が指すセグメントと当選者が一致しない問題）
- アニメーション終了時のイージング関数を修正（ease-out-expo → ease-out-quint）して約2度のジャンプを解消

## [0.0.1] - 2026-01-20

### 追加

- お名前ルーレット 初回リリース
- SVGアニメーションによるルーレット回転
- 改行区切りで参加者を入力
- 「さん」付けオプション
- URLで参加者リストを共有
- 当選者表示オーバーレイ
- レスポンシブデザイン（モバイル・デスクトップ対応）
- SNS共有用OGP画像
- ルーレットデザインのファビコン
- 全コンポーネントのStorybook
- ドラッグでルーレットを回転可能（慣性付き）
- 「待った！」ボタンで当選者の確率を半減して再抽選
- 前回当選者の除外確認ダイアログ
- URLに当選者を保存してリロード時も復元
- 右クリックメニューで確率2倍/削除機能
- カチカチ音とファンファーレのサウンドエフェクト
- 紙吹雪と花火の当選演出
- 当選者右クリックで次の人にシフト機能

### 技術スタック

- React 18 + TypeScript + Vite
- Tailwind CSS v4
- Radix UI（アクセシブルなチェックボックス）
- class-variance-authority（コンポーネントバリアント）
- Vitest + Testing Library（100テスト）
- ESLint + Prettier + cspell
- GitHub Actions CI/CD
- GitHub Pages デプロイ
