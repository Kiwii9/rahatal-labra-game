# Three fixes + one new feature

## 1. Stop room code from changing on every refresh

**Today:** `Lobby.tsx` calls `createRoom()` on mount, so every page reload spawns a brand-new room with a brand-new code. Guests who already scanned the old code get "غرفة غير موجودة".

**Fix:**
- Persist the active room id in `localStorage` (key `lov.activeRoomId`) right after `createRoom` succeeds.
- On Lobby mount: if a stored room id exists *and* its row still has `status='waiting'` *and* the current user is the host, **reuse it**. Otherwise create a new one.
- Add a **"رمز جديد"** button next to the room code that calls a new `regenerateRoomCode()` helper — UPDATE on `rooms.room_code`, refresh QR + clipboard text, toast "تم تحديث الرمز".
- Clear `lov.activeRoomId` when the host hits "الرئيسية" or after a winner is declared.

**Files:** `src/hooks/useRoom.ts`, `src/pages/Lobby.tsx`, `src/pages/Game.tsx`.

---

## 2. Fix host vs guest seeing different custom questions

**Today:** When a letter has >1 custom question, `resolveQuestion` rolls `Math.random()` independently on host and on every guest → different question text per device.

**Fix:** Host picks the question index authoritatively; everyone reads it from the room row.
- Add `current_question_idx int` (nullable) to `public.rooms`.
- When host clicks a hex: pick the index, write `current_hex_index` + `current_question_idx` to the room.
- `resolveQuestion(letter, room)` reads `room.current_question_idx` instead of randomizing.
- Host clears both fields when the question modal closes.

**Files:** migration, `src/lib/questionResolver.ts`, `src/pages/Game.tsx`.

---

## 3. New: Audience / TV View — chosen from the player join screen

A read-only spectator mode for casting to a TV. The user explicitly asked that it be **picked from the player-join screen** (`/join`), not via a separate URL.

**Join screen change (`src/pages/GuestJoin.tsx`):**
After the guest enters the room code and it validates, show **two big choice cards** before any name/team picker:

1. **🎮 ادخل كلاعب** — current flow (name + team + avatar, becomes a player row).
2. **📺 شاشة العرض (للجمهور)** — no name, no team, no DB row. Routes straight to `/tv?room=<id>`.

**TV View page (`src/pages/TVView.tsx`):**
- 16:9 layout, large fonts, no controls, no buzzer.
- Top bar: game title + both team names (with their colors) + live scores.
- Center: the hex board (uses the sanitized board — golden flag stripped, same as guests).
- When the host has a question open, a fullscreen TV-styled card replaces the board: letter, category, question text, image/video, countdown timer. **The answer stays hidden until the host reveals it.**
- Bottom: small "اللعبة من إدارة {hostName}" + a tiny QR pointing back to `/join?code=...` so audience members can grab a phone seat if they want.

**Synced answer reveal (small addition):** add `answer_revealed boolean default false` to `rooms`. The host's "Reveal answer" toggle (currently local) writes to this column so TV + guests reveal together.

**Files:** new `src/pages/TVView.tsx`, edit `src/pages/GuestJoin.tsx` (add the choice step), register `/tv` route in `src/App.tsx`, small writes from `src/pages/Game.tsx` for `answer_revealed`.

---

## 4. Real end-to-end game-flow test

After all of the above ships, run an actual multi-tab session with the browser tool:
1. Host `/lobby` → reload once → confirm room code is **stable**. Click "رمز جديد" → confirm new code propagates.
2. Tab 2: open guest join URL → choose **"ادخل كلاعب"** → join Team 1.
3. Tab 3: open same join URL → choose **"شاشة العرض"** → land on `/tv` with no DB row created.
4. Host starts game using **custom questions** with 2 questions per letter (to exercise the desync fix).
5. Host clicks a hex → confirm the same question text/image renders on host, player, and TV.
6. Host marks "Correct → Team 1" → score, board, and turn update on all three screens.
7. Confirm the Arabic toggle button on the guest player screen is present on first paint (no flicker).

Screenshots captured for any drift; fix on the spot.

---

## Database migration (one file)

```sql
alter table public.rooms
  add column if not exists current_question_idx int,
  add column if not exists answer_revealed boolean not null default false;
```

No RLS changes needed — existing policies cover these columns. TV view relies on the existing public read on `rooms`.

---

## Out of scope (kept explicit)

- Wiring the buzzer into the question flow.
- Wiring grid sizes / rounds / starter team into actual game logic.
- Saving / reusing custom question packs across games.
