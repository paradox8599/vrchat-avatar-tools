bun run env on
sh -c "sleep 30 && bun run env off &"
bun run tauri dev
bun run env off
