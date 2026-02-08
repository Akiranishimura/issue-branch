#!/usr/bin/env node
import meow from "meow";
import { render } from "ink";
import { loadConfig, initConfig } from "./lib/config.js";
import { App } from "./app.js";

const cli = meow(
  `
  Usage
    $ ib            Select an issue and create a branch
    $ ib init       Create config file

  Options
    --assignee, -a  Issue assignee (default: @me)
    --template, -t  Branch name template (e.g. "feature/{number}-{title}")

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

if (subcommand === "init") {
  const { created, path } = await initConfig();
  if (created) {
    console.log(`✔ Created config: ${path}`);
  } else {
    console.log(`Config already exists: ${path}`);
  }
  process.exit(0);
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
