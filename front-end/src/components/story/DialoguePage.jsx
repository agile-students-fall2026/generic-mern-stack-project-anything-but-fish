export default function DialoguePage({ page, character }) {
  return (
    <article className="story-dialogue" aria-label="Dialogue page">
      {page.background.src ? (
        <div className="story-dialogue__background">
          <img src={page.background.src} alt={page.background.description} />
        </div>
      ) : (
        <div className="story-dialogue__background-placeholder" role="img" aria-label={page.background.description || "Background"}>
          <strong>Background</strong>
          <p>{page.background.description}</p>
        </div>
      )}

      {(character || page.content.length > 0) && (
        <div className="story-dialogue__foreground">
          {character && (
            <div className="story-dialogue__portrait">
              {character.portrait ? (
                <img src={character.portrait} alt={character.name} />
              ) : (
                <span role="img" aria-label={`${character.name} portrait placeholder`}>Portrait</span>
              )}
            </div>
          )}
          <div className="story-dialogue__box">
            {character && <h2 className="story-reader__speaker">{character.name}</h2>}
            {page.content.map((text, index) => <p key={index}>{text}</p>)}
          </div>
        </div>
      )}
    </article>
  );
}
