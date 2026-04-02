# お名前ルーレット

ランダムに名前を選ぶルーレットアプリ

## Demo

https://usapopopooon.github.io/name-roulette/

## Features

- SVGアニメーションによるルーレット回転
- 改行区切りで参加者を入力
- 「さん」付けオプション（各行の名前の直後にオーバーレイ表示）
- URLで参加者リストを共有
- ドラッグでルーレットを回転可能（慣性付き）
- 「待った！」ボタンで当選者の確率を半減して再抽選
- 前回当選者の除外確認ダイアログ
- 右クリックメニューで確率2倍/削除
- 当選者右クリックで次の人にシフト
- 同名参加者を個別に管理
- 参加者リストのシャッフル
- 動物乱入演出（猫/アヒル）
- カチカチ音・ファンファーレの効果音（Web Audio API）
- 紙吹雪と花火の当選演出
- レスポンシブデザイン

## Tech Stack

- React 19 + TypeScript + Vite 6
- Tailwind CSS v4
- Radix UI
- Vitest + Testing Library
- Storybook
- GitHub Actions CI/CD → GitHub Pages

## Development

```bash
npm install
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | プロダクションビルド |
| `npm run test` | テスト実行 |
| `npm run storybook` | Storybook起動 |
| `npm run lint` | ESLint実行 |
| `npm run format` | Prettier実行 |
