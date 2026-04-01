#Requires -Version 5.1
param(
    [Parameter(Position = 0)]
    [string]$Command = "help",
    [Parameter(Position = 1, ValueFromRemainingArguments)]
    [string[]]$Args
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

# ── Runtime detection (prefer Podman) ──────────────────────────────────────────

function Get-ComposeCommand {
    if ((Get-Command podman -ErrorAction SilentlyContinue) -and (Get-Command podman-compose -ErrorAction SilentlyContinue)) {
        return "podman-compose"
    }
    if (Get-Command docker -ErrorAction SilentlyContinue) {
        $v2 = & docker compose version 2>&1
        if ($LASTEXITCODE -eq 0) { return "docker compose" }
        if (Get-Command docker-compose -ErrorAction SilentlyContinue) { return "docker-compose" }
    }
    Write-Error @"
No container runtime found. Install one of:
  - Podman + podman-compose
  - Docker Desktop (includes docker compose V2)
  - Docker Engine + docker-compose
"@
    exit 1
}

$Compose = Get-ComposeCommand

function Invoke-Compose {
    param([string[]]$ComposeArgs)
    if ($Compose -eq "docker compose") {
        & docker compose @ComposeArgs
    } else {
        & $Compose @ComposeArgs
    }
}

# ── Commands ───────────────────────────────────────────────────────────────────

switch ($Command) {
    "up" {
        Invoke-Compose @("up", "-d", "--build") + $Args
    }
    "down" {
        Invoke-Compose @("down") + $Args
    }
    "restart" {
        Invoke-Compose @("restart") + $Args
    }
    "logs" {
        Invoke-Compose @("logs", "-f") + $Args
    }
    "status" {
        Invoke-Compose @("ps") + $Args
    }
    "shell" {
        Invoke-Compose @("exec", "web", "sh")
    }

    # ── Development commands ─────────────────────────────────────────────────

    "test" {
        Invoke-Compose @("exec", "web", "pnpm", "test") + $Args
    }
    "lint" {
        Invoke-Compose @("exec", "web", "pnpm", "lint") + $Args
    }
    "lint:fix" {
        Invoke-Compose @("exec", "web", "pnpm", "lint:fix") + $Args
    }
    "format" {
        Invoke-Compose @("exec", "web", "pnpm", "format") + $Args
    }
    "format:check" {
        Invoke-Compose @("exec", "web", "pnpm", "format:check") + $Args
    }
    "typecheck" {
        Invoke-Compose @("exec", "web", "pnpm", "typecheck") + $Args
    }
    "precheck" {
        Invoke-Compose @("exec", "web", "pnpm", "precheck") + $Args
    }
    "preview" {
        Invoke-Compose @("exec", "web", "pnpm", "preview") + $Args
    }
    "run" {
        Invoke-Compose @("exec", "web", "pnpm") + $Args
    }

    # ── Lifecycle commands ─────────────────────────────────────────────────────

    "clean" {
        Write-Host "This will remove the container and volumes."
        $confirm = Read-Host "Continue? [y/N]"
        if ($confirm -match "^[Yy]$") {
            Invoke-Compose @("down", "-v")
        } else {
            Write-Host "Aborted."
        }
    }
    "fresh" {
        Write-Host "This will destroy the container, volumes, and images for this project."
        Write-Host "Everything will be rebuilt from scratch."
        $confirm = Read-Host "Continue? [y/N]"
        if ($confirm -match "^[Yy]$") {
            Invoke-Compose @("down", "-v", "--rmi", "local", "--remove-orphans")
            Write-Host ""
            Write-Host "Clean slate. Run '.\fweb.ps1 up' to rebuild and start."
        } else {
            Write-Host "Aborted."
        }
    }
    "build" {
        Invoke-Compose @("build", "--no-cache") + $Args
    }
    "setup" {
        if (-not (Test-Path .env)) {
            Copy-Item .env.example .env
            Write-Host "Created .env from .env.example"
        } else {
            Write-Host ".env already exists, skipping copy."
        }
        Write-Host "Remember to fill in credentials in .env (Auth0, etc.)"
    }
    default {
        @"
Usage: .\fweb.ps1 <command> [args]

Services:
  up                     Start the dev server (build + detached)
  down                   Stop and remove the container
  restart                Restart the container
  logs                   Tail logs
  status                 Show container status
  shell                  Open a shell in the container

Development:
  test                   Run vitest test suite
  lint                   Run ESLint
  lint:fix               Run ESLint with auto-fix
  format                 Format code with Prettier
  format:check           Check formatting with Prettier
  typecheck              Run TypeScript type checking
  precheck               Run lint + format:check + typecheck + test
  preview                Preview the production build
  run <script>           Run a pnpm script inside the container

Lifecycle:
  clean                  Remove container and volumes
  fresh                  Nuke everything: container, volumes, and images
  build                  Rebuild container without cache
  setup                  Copy .env.example -> .env if missing
"@
    }
}
