cma-bot
=======

hi :3

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/cma-bot.svg)](https://npmjs.org/package/cma-bot)
[![Downloads/week](https://img.shields.io/npm/dw/cma-bot.svg)](https://npmjs.org/package/cma-bot)
[![License](https://img.shields.io/npm/l/cma-bot.svg)](https://github.com/lyaunzbe/cma-bot/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g cma-bot
$ cma-bot COMMAND
running command...
$ cma-bot (-v|--version|version)
cma-bot/0.0.0 darwin-x64 node-v14.7.0
$ cma-bot --help [COMMAND]
USAGE
  $ cma-bot COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`cma-bot hello [FILE]`](#cma-bot-hello-file)
* [`cma-bot help [COMMAND]`](#cma-bot-help-command)

## `cma-bot hello [FILE]`

describe the command here

```
USAGE
  $ cma-bot hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ cma-bot hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/lyaunzbe/cma-bot/blob/v0.0.0/src/commands/hello.ts)_

## `cma-bot help [COMMAND]`

display help for cma-bot

```
USAGE
  $ cma-bot help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.0/src/commands/help.ts)_
<!-- commandsstop -->
