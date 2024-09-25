$env:TAURI_SIGNING_PRIVATE_KEY=$(bun -e 'console.log(process.env.TAURI_SIGNING_PRIVATE_KEY)')
$env:TAURI_SIGNING_PRIVATE_KEY_PASSWORD=$(bun -e 'console.log(process.env.TAURI_SIGNING_PRIVATE_KEY_PASSWORD)')
bun tauri build

