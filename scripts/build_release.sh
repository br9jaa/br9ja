#!/usr/bin/env sh

set -eu

usage() {
  cat <<'EOF'
Usage: ./scripts/build_release.sh [apk|appbundle|ipa]

Builds a Flutter release artifact with Dart obfuscation enabled and writes
split debug symbols under build/obfuscation/<target>.
EOF
}

target="${1:-apk}"
project_root="$(cd "$(dirname "$0")/.." && pwd)"
backend_env_file="$project_root/backend/.env.prod"

cd "$project_root"

if [[ -f "$backend_env_file" ]]; then
  set -a
  # shellcheck disable=SC1090
  . "$backend_env_file"
  set +a
fi

prod_api_url="${PUBLIC_API_URL:-https://api.bayright9ja.com}"

case "$prod_api_url" in
  *10.0.2.2*|*localhost*|*127.0.0.1*)
    printf 'Refusing release build: BASE_URL points to a local development host (%s).\n' "$prod_api_url" >&2
    exit 1
    ;;
esac

case "$target" in
  apk)
    split_dir="build/obfuscation/android-apk"
    mkdir -p "$split_dir"
    flutter build apk --release --obfuscate --split-debug-info="$split_dir" \
      --dart-define=BASE_URL="$prod_api_url"
    ;;
  appbundle|aab)
    split_dir="build/obfuscation/android-appbundle"
    mkdir -p "$split_dir"
    flutter build appbundle --release --obfuscate --split-debug-info="$split_dir" \
      --dart-define=BASE_URL="$prod_api_url"
    ;;
  ipa|ios)
    split_dir="build/obfuscation/ios"
    mkdir -p "$split_dir"
    flutter build ipa --release --obfuscate --split-debug-info="$split_dir" \
      --dart-define=BASE_URL="$prod_api_url"
    ;;
  *)
    usage
    exit 1
    ;;
esac

printf 'Built %s release with obfuscation.\n' "$target"
printf 'Injected BASE_URL=%s\n' "$prod_api_url"
printf 'Split debug info stored in %s\n' "$split_dir"
