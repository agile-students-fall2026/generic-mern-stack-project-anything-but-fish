export default function ArchivePage({ page }) {
  return (
    <article className="story-archive" aria-label="Archive page">
      {page.blocks.map((block, index) => (
        block.type === "image" ? (
          <figure className="story-archive__photo" key={index}>
            {block.src ? (
              <img src={block.src} alt={block.description} />
            ) : (
              <div className="story-archive__photo-placeholder" role="img" aria-label={block.description || "Photo"}>
                <strong>Photo</strong>
                <p>{block.description}</p>
              </div>
            )}
          </figure>
        ) : (
          <p className="story-archive__text" key={index}>{block.text}</p>
        )
      ))}
    </article>
  );
}
