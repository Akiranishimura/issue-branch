# issue-branch (`ib`)

GitHub Issue起点のブランチ作成CLIツール。自分にアサインされたIssueをファジー検索で選択し、ブランチを作成&チェックアウトする。

## Requirements

- [git](https://git-scm.com/)
- [gh CLI](https://cli.github.com/) (認証済み)
- [bun](https://bun.sh/) or [Node.js](https://nodejs.org/) >= 18

## Install

```bash
# from source
git clone <repo-url>
cd issue-branch
bun install && bun run build
bun link

# npm (future)
npm install -g issue-branch
```

## Usage

```bash
# gitリポジトリ内で実行
ib
```

1. 自分にアサインされたオープンIssueを取得
2. ファジー検索で絞り込み (↑↓で選択、Enterで決定)
3. テンプレートに基づきブランチを作成&チェックアウト

### Options

```
--assignee, -a  Issue assignee (default: @me)
--template, -t  Branch name template (e.g. "fix/{number}-{title}")
```

### Subcommands

```bash
ib init    # 設定ファイルを作成
```

## Config

XDG Base Directory準拠。`$XDG_CONFIG_HOME/issue-branch/config.json` (デフォルト: `~/.config/issue-branch/config.json`)

```bash
ib init  # デフォルト設定で作成
```

```json
{
  "branchTemplate": "feature/{number}-{title}",
  "maxIssues": 50
}
```

### Template variables

| Variable | Description |
|----------|-------------|
| `{number}` | Issue番号 |
| `{title}` | Issueタイトル (slugify済み、60文字制限) |

### Template examples

```json
"feature/{number}-{title}"  // feature/42-add-login-page
"fix/{number}-{title}"      // fix/123-fix-null-pointer
"{number}-{title}"           // 42-add-login-page
```

## Development

```bash
bun install
bun run dev          # src/cli.tsx を直接実行
bun run build        # tsc でコンパイル
```

## License

MIT
