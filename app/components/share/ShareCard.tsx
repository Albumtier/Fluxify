export default function ShareCard({ track, lyrics }: any) {
  // Normalize lyrics → always an array
  const lyricLines =
    Array.isArray(lyrics)
      ? lyrics
      : typeof lyrics === "string"
      ? lyrics.split("\n").filter(Boolean)
      : [];

  return (
    <div
      id="share-card"
      style={{
        width: "350px",
        padding: "24px",
        borderRadius: "16px",
        backgroundColor: track.dominantColor || "#cf5248",
        color: track.dominantTextColor || "black",
        fontFamily: '"Geist", sans-serif',
        position: "relative",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <img
          src={track.cover}
          alt={track.title}
          width={60}
          height={60}
          style={{
            borderRadius: "12px",
            objectFit: "cover",
            display: "block",
          }}
        />

        <div style={{ marginLeft: "12px" }}>
          <p
            style={{
              fontWeight: 700,
              fontSize: "20px",
              margin: 0,
              lineHeight: "22px",
            }}
          >
            {track.title}
          </p>

          <p
            style={{
              opacity: 0.8,
              fontSize: "13px",
              margin: "4px 0 0 0",
              lineHeight: "16px",
            }}
          >
            {track.artist}
          </p>
        </div>
      </div>

      {/* Lyrics */}
      <div style={{ marginBottom: "56px" }}>
        {lyricLines.map((line: string, index: number) => (
          <p
            key={index}
            style={{
              fontWeight: 600,
              fontSize: "18px",
              lineHeight: "24px",
              margin: 0,
              whiteSpace: "pre-line",
            }}
          >
            {line}
          </p>
        ))}
      </div>

      {/* Logo only */}
      <img
        src="/favicon.ico"
        alt="Fluxify logo"
        width={16}
        height={16}
        style={{
          position: "absolute",
          bottom: "16px",
          left: "16px",
          objectFit: "cover",
          borderRadius: "3px",
          display: "block",
          opacity: 0.8,
        }}
      />
    </div>
  );
}
