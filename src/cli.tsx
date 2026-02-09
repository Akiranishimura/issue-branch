#!/usr/bin/env node
import meow from "meow";
import { render } from "ink";
import { loadConfig, initConfig, getConfigPath } from "./lib/config.js";
import { App } from "./app.js";

const configPath = getConfigPath();

const cli = meow(
  `
  Usage
    $ ib                Select an issue and create a branch
    $ ib init           Create config file (~/.config/issue-branch/config.json)
    $ ib help           Show this help message

  Options
    --assignee, -a      Issue assignee (default: @me)
    --template, -t      Branch name template

  Template variables
    {number}            Issue number
    {title}             Issue title (kebab-cased)

  Config (${configPath})
    branchTemplate      Default branch template (default: "feature/{number}-{title}")
    maxIssues           Max issues to fetch (default: 50)

  Examples
    $ ib
    $ ib init
    $ ib --assignee octocat
    $ ib --template "fix/{number}-{title}"
`,
  {
    importMeta: import.meta,
    flags: {
      assignee: {
        type: "string",
        shortFlag: "a",
        default: "@me",
      },
      template: {
        type: "string",
        shortFlag: "t",
      },
    },
  },
);

const subcommand = cli.input[0];

if (subcommand === "help") {
  cli.showHelp(0);
}

if (subcommand === "init") {
  const { created, path } = await initConfig();
  if (created) {
    console.log(`✔ Created config: ${path}`);
  } else {
    console.log(`Config already exists: ${path}`);
  }
  process.exit(0);
}

if (subcommand && !["init", "help"].includes(subcommand)) {
  console.error(`Unknown command: ${subcommand}\n`);
  cli.showHelp(1);
}

const config = await loadConfig();

render(
  <App
    flags={{
      assignee: cli.flags.assignee,
      template: cli.flags.template,
    }}
    config={config}
  />,
);
