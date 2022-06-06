oclif-hello-world
=================

oclif example Hello World CLI

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/oclif-hello-world.svg)](https://npmjs.org/package/oclif-hello-world)
[![CircleCI](https://circleci.com/gh/oclif/hello-world/tree/main.svg?style=shield)](https://circleci.com/gh/oclif/hello-world/tree/main)
[![Downloads/week](https://img.shields.io/npm/dw/oclif-hello-world.svg)](https://npmjs.org/package/oclif-hello-world)
[![License](https://img.shields.io/npm/l/oclif-hello-world.svg)](https://github.com/oclif/hello-world/blob/main/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g @usher/admin-cli
$ uadmin COMMAND
running command...
$ uadmin (--version)
@usher/admin-cli/0.0.0 darwin-arm64 node-v16.14.0
$ uadmin --help [COMMAND]
USAGE
  $ uadmin COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`uadmin hello PERSON`](#uadmin-hello-person)
* [`uadmin hello world`](#uadmin-hello-world)
* [`uadmin help [COMMAND]`](#uadmin-help-command)
* [`uadmin plugins`](#uadmin-plugins)
* [`uadmin plugins:install PLUGIN...`](#uadmin-pluginsinstall-plugin)
* [`uadmin plugins:inspect PLUGIN...`](#uadmin-pluginsinspect-plugin)
* [`uadmin plugins:install PLUGIN...`](#uadmin-pluginsinstall-plugin-1)
* [`uadmin plugins:link PLUGIN`](#uadmin-pluginslink-plugin)
* [`uadmin plugins:uninstall PLUGIN...`](#uadmin-pluginsuninstall-plugin)
* [`uadmin plugins:uninstall PLUGIN...`](#uadmin-pluginsuninstall-plugin-1)
* [`uadmin plugins:uninstall PLUGIN...`](#uadmin-pluginsuninstall-plugin-2)
* [`uadmin plugins update`](#uadmin-plugins-update)

## `uadmin hello PERSON`

Say hello

```
USAGE
  $ uadmin hello [PERSON] -f <value>

ARGUMENTS
  PERSON  Person to say hello to

FLAGS
  -f, --from=<value>  (required) Whom is saying hello

DESCRIPTION
  Say hello

EXAMPLES
  $ oex hello friend --from oclif
  hello friend from oclif! (./src/commands/hello/index.ts)
```

_See code: [dist/commands/hello/index.ts](https://github.com/usher/hello-world/blob/v0.0.0/dist/commands/hello/index.ts)_

## `uadmin hello world`

Say hello world

```
USAGE
  $ uadmin hello world

DESCRIPTION
  Say hello world

EXAMPLES
  $ oex hello world
  hello world! (./src/commands/hello/world.ts)
```

## `uadmin help [COMMAND]`

Display help for uadmin.

```
USAGE
  $ uadmin help [COMMAND] [-n]

ARGUMENTS
  COMMAND  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for uadmin.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.1.10/src/commands/help.ts)_

## `uadmin plugins`

List installed plugins.

```
USAGE
  $ uadmin plugins [--core]

FLAGS
  --core  Show core plugins.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ uadmin plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.0.11/src/commands/plugins/index.ts)_

## `uadmin plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ uadmin plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.

  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.

ALIASES
  $ uadmin plugins add

EXAMPLES
  $ uadmin plugins:install myplugin 

  $ uadmin plugins:install https://github.com/someuser/someplugin

  $ uadmin plugins:install someuser/someplugin
```

## `uadmin plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ uadmin plugins:inspect PLUGIN...

ARGUMENTS
  PLUGIN  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ uadmin plugins:inspect myplugin
```

## `uadmin plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ uadmin plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.

  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.

ALIASES
  $ uadmin plugins add

EXAMPLES
  $ uadmin plugins:install myplugin 

  $ uadmin plugins:install https://github.com/someuser/someplugin

  $ uadmin plugins:install someuser/someplugin
```

## `uadmin plugins:link PLUGIN`

Links a plugin into the CLI for development.

```
USAGE
  $ uadmin plugins:link PLUGIN

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Links a plugin into the CLI for development.

  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.

EXAMPLES
  $ uadmin plugins:link myplugin
```

## `uadmin plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ uadmin plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ uadmin plugins unlink
  $ uadmin plugins remove
```

## `uadmin plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ uadmin plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ uadmin plugins unlink
  $ uadmin plugins remove
```

## `uadmin plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ uadmin plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ uadmin plugins unlink
  $ uadmin plugins remove
```

## `uadmin plugins update`

Update installed plugins.

```
USAGE
  $ uadmin plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```
<!-- commandsstop -->
