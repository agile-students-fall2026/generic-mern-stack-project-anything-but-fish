# NPC chat front end

Create the project, then copy `src/` over the generated one:

    npm create vite@latest npc-chat -- --template react
    cd npc-chat && npm install
    # replace the generated src/ files with these, then:
    npm run dev

Integration: render `<NpcChatFlow onExit={() => /* go to main menu */} />`
when the user presses "Chat With Characters".
