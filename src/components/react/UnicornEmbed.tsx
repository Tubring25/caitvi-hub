import { useMediaQuery } from "@/hooks/use-media-query";
import { useState } from "react";

export default function UnicornEmbed() {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [loaded, setLoaded] = useState(false);

  if(!isDesktop) return null;
  
  return (
    <div
      style={{
        position: 'absolute',
        top: '6vh',
        left: '10vw',
        right: '10vw',
        bottom: '14vh',
        zIndex: 1,
        opacity: loaded ? 1 : 0,
        transition: 'opacity 0.5s ease-in-out',
      }}
      aria-hidden="true"
    >
      <iframe
        src="/unicorn-embed.html"
        onLoad={() => setLoaded(true)}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block',
        }}
        title="Background Effect"
      />
    </div>
  )
}