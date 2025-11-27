|カテゴリ|利用技術|Status|
|---|---|--|
|フロントエンド|Next.js|インストール済|
|ホスティング|AppRunner|実装中|
|認証|Cognito|未実装|
|サーバーログ|Pino|インストール済|
|外部ログ出力先|AWS CloudWatch, Sentry|未実装|
|エラー解析|Sentry|未実装|
|ORM|Prisma|インストール済|
|linter/formatter|Biome|インストール済|
|単体テスト|Jest|インストール済|
|E2Eテスト|Playwright|未実装|
|in-memory Cash|AWS Redis|未実装|

## Hosting Service選定経緯

【候補①】Amplify

---

→ 完全サーバーレスのためコスト的には最適

→ Next.jsをAmplifyで動かすと以下のような制約がある

- SSR関数（Lambda-like）のserver bumdleのサイズが220MBという制限がある
- ISR, On-Demand ISR（revalidatePath/revalidateTag）が使えない
- cold startのためSSRのresponseが遅い（1〜3秒もあり得る）
- 特殊な実装でNext.jsアプリをサーバーレス可しており、実装がBlack-Box化されている

→ つまりSSG + CSRの構成でDeployすればAmplifyで問題なくHostできるが、Next.jsの前提となるSSRや最新のcache機能が使えない

→ また、Amplifyは独立したコマンドによる管理となるため、CDKで一元管理できない

→ 結論：❌

---

【候補②】ECS Fargate

---

→ 柔軟な設計が可能だがALBや常時起動によりコストが高い

→ 対象のアプリにはoverkill

→ 結論：❌

---

【候補③】AppRunner

---

→ コンテナベースのため、Next.jsの機能をFullで実行可能

→ CDKで完全IaCにて一元管理可能

→ Always-warmでSSRが高速･安定

→ bumdleサイズの制限なし

→ 最小構成で構築すれば月額$3~5 USD

→ 結論：⭕️（採用！）