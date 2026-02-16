# tt-health

A Bun terminal tool for scanning a project tree and surfacing comment-marker counts in JS/TS files.

Prerequisite: Bun must be installed.

## Usage

### Simple

```bash
bunx github:picoderman/tt-health
```

### With installation

```bash
bun add github:picoderman/tt-health
cd your-project
tth
```

Running without args targets the current directory. You can also pass a path, for example:

```bash
tth ./src
```

## Controls

- `q` quit
- `↑/↓/→/←` navigate
- `c` edit markers
- `t` toggle theme
