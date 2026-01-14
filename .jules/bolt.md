## 2025-05-24 - [Immutable State for Streaming Performance]
**Learning:** In streaming chat applications, mutating the last message object in place causes `React.memo` to fail because the object reference doesn't change.
**Action:** Always create a new object reference (e.g., `{ ...lastMsg, content: newContent }`) when updating state during streaming to enable efficient list rendering with `React.memo`.
