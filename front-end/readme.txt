Run from the front-end directory:
  npm install
  cp .env.example .env
  npm run dev

Build:
  npm run build

Register, Login, PasswordRecovery, and ResetPassword share AuthPage.jsx/CSS.
The template assembles the original signup scenery and each page's label/stamp
artwork, with transparent native inputs aligned to the handwritten lines.
Login has email/password; recovery has the supplied title and one email field;
register retains three fields. Each stamp shows only its red text until hover,
focus, or press reveals the frame. Recovery reuses the register frame.
Footer links connect Login, Sign Up, Forgot password, and Home without moving
the form. Native validation, loading states, and server errors remain in place.
Register submits to /api/auth/register and opens /account-created only after
success; leaving the page cancels its pending request. Login keeps its existing
destination handling and accepts any nonempty password. Recovery sends email
to /api/auth/forgot-password; its success message appears only after the response.
The emailed /reset-password?token=... page still requires two matching passwords
of 8–128 characters and a token, then opens /reset-confirmation after success.
Original layers are in src/assets/signup; new title/stamps are in src/assets/auth.
Every PNG keeps its original 1500 x 3249 canvas; CSS clips stray export dots below
the new button text. Positions, scaling, and interaction styles use CSS only.
AuthPage.css uses a 394 CSS-pixel base width (--auth-page-base-width) and grows
the artwork to fill taller screens vertically, capped at the screen width.
Wider screens have black sidebars; shorter screens crop the top/bottom evenly.
Narrow, tall screens fit the width and may have black space above/below instead.
Login/recovery label layers and their inputs share the reference's CSS offsets.
Main Screen and game routes are temporarily open for frontend development.
Use "Continue without logging in" on Welcome, or open /starting directly.
The / welcome page shares MainMenuLayout and artwork with /starting. Its only
buttons are Sign Up (/register) and Login (/login), aligned with Start Game and
Chat with NPCs. Both menus use the same four-row CSS footprint, leaving the lower
two rows blank on Welcome. A separately positioned small bottom link opens
/starting without logging in and does not shift the buttons. Layout and animation
use no JS measurements.
The /starting main menu uses the supplied 1500 x 3249 artwork in
src/assets/main-screen: background, white/red light, then line art on top.
CSS switches instantly between 1.8 seconds of white light and 0.2 seconds of red
light. The two layers have complementary opacity, so only one is visible at a time.
Four textured buttons retain the existing destinations:
/game, /chat, /collections, /plots. Their reference typography is local
Chakra Petch SemiBold, 93px/121px at a 1760px canvas width, with 0.01em spacing.
The canvas follows Register's CSS sizing; the menu shifts up on short screens
to keep all buttons reachable. Signed-in users retain the Log Out control.
Auth pages still call the backend API; /api/auth/me checks for an existing session
on refresh. Credentials are not persisted in browser storage.
Password recovery uses an emailed reset link; there is no verification-code step.

VITE_API_BASE_URL is public configuration and defaults to /api.
API_PROXY_TARGET defaults to http://127.0.0.1:8000 for the development proxy.
Restart Vite after changing .env. In production configure a reverse proxy for
/api, or set VITE_API_BASE_URL and configure backend CORS/cookies appropriately.
Never place MongoDB credentials or other secrets in VITE_* variables.

The backend is not implemented yet. Auth requests will show an error until the
backend endpoints documented in ../back-end/readme.txt are available. Account
creation and reset confirmation are reached after successful API responses.
The story reader at /game loads src/content/story/ancient-gold-coin.json.
The draft contains 19 pages: 14 dialogue pages and 5 archive pages.
See src/content/story/README.md for the JSON format, block types, and artwork paths.
The current game uses /game/1 through /game/14, numbered from the first dialogue.
/game and invalid page numbers redirect to /game/1. Refresh and browser Back/Forward
follow the page in the URL; saving progress is not implemented yet.
Game.jsx assembles the supplied story artwork with
13 original PNG layers in src/assets/game, each at 1760 x 3808.
It reads only chapter pages with a speaker and displays their dialogue without
speaker names or scene descriptions. The radio's upper-left and lower-left
buttons move to the previous/next dialogue, stopping at the chapter boundaries.
Dialogue uses locally hosted Chakra Petch SemiBold from Google Fonts
(https://github.com/google/fonts/tree/main/ofl/chakrapetch), with the OFL license
in src/assets/fonts/chakra-petch. Design text is 63px with an 81px line height,
color #646064, and a 46% #A0AA9C shadow; all metrics scale with the canvas.
Four placeholder images are copied unchanged into src/assets/game/scenes.
Each dialogue is assigned a random image once per visit. The original illustration's
alpha channel masks the image; SVG slice fills the area without distortion,
using visible artwork bounds to exclude the legacy image's transparent padding.
Page changes wait for the next image to decode, then update the dialogue and
replace the whole SVG together so old pixels never use the next image's crop.
Navigation is disabled during loading; failed loads retain the current page and
allow retrying.
Game.css uses the same CSS-only sizing as Register: a 394px base width,
expansion for taller screens, black sidebars, and centered cropping on short screens.
The upper-left home icon returns to /starting; inventory and settings icons
are currently placeholders. The former /story-preview route has been removed.
The original 19-page reader is retained in GameOld.jsx and GameOld.css, with its
dialogue/archive components and chapter data unchanged. To view it again, uncomment
the GameOld import and /game-old routes in App.jsx. It retains ID-based page URLs
such as /game-old/pond and /game-old/pond-b-nervous.
The shared /inventory page returns to the screen that opened it. Inventory is
currently a placeholder; collecting and storing items is not implemented yet.
The /chat route opens the character chooser directly, without the old NPCChat
intermediate page. The illustrated chooser displays Cislobog Raskolnikov;
selecting his button opens /chat/cislo via /chat/:name. During frontend
development, any name uses the current cislo artwork without redirecting.
The former /npc-chat, /choose-character, and /character-chat
routes have been removed. The chooser contains character-name buttons and Back;
inventory is available inside the character chat.
ChooseCharacter.css enlarges the chat environment to fill its portrait canvas
and stretches the homepage button artwork horizontally. The chooser has its own
classes and uses the same Chakra Petch size as the homepage, with CSS-only scaling
and positioning. The small cat in the reference is decorative.
CharacterChat.jsx assembles the original 1500 x 3249 environment, cislo portrait,
and document layers with the input frame and cat decorations in src/assets/chat.
The transparent native textarea aligns to the frame and uses the shared local
Chakra Petch font. It supports drafting text only; chat submission is not implemented.
The small cat is an absolutely positioned, disabled emoji control within the input
frame and may overlap the text. Symmetric horizontal padding and vertical padding
keep text away from the frame's decorative corners. The arrow returns to /chat;
Inventory returns to the character chat that opened it.
Canvas scaling and control positioning use CSS only, with short-screen
offsets to keep the input and navigation visible.
The other game screens are navigation placeholders.
