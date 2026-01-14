## 2024-05-23 - React Performance in Chat Apps
**Learning:** `MessageBubble` components re-rendered on every keystroke because the parent `Home` component manages the input state. This caused visible typing lag.
**Action:** Use `React.memo` for list items in chat interfaces where the parent component updates frequently (e.g., input state).
