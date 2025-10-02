import { useState, useRef, useEffect, cloneElement } from "react";

export default function SpotlightWrapper(props) {
  const { children } = props || {}; // ✅ safe: won't crash if props is undefined

  const [pos, setPos] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [fade, setFade] = useState(0);
  const mouseRef = useRef({ x: pos.x, y: pos.y });

  function handleMouseMove(e) {
    mouseRef.current = { x: e.clientX, y: e.clientY };
    setFade(1);
  }

  useEffect(() => {
    let frame;
    function animate() {
      setPos((prev) => ({
        x: prev.x + (mouseRef.current.x - prev.x) * 0.08,
        y: prev.y + (mouseRef.current.y - prev.y) * 0.08,
      }));
      setFade((f) => Math.max(0, f - 0.01));
      frame = requestAnimationFrame(animate);
    }
    animate();
    return () => cancelAnimationFrame(frame);
  }, []);

  function getLetterOpacity(elCenterX, elCenterY) {
    const dx = pos.x - elCenterX;
    const dy = pos.y - elCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const fadeStart = 160, fadeEnd = 40;
    if (fade <= 0) return 0;
    if (distance < fadeStart) {
      return (1 - Math.min((distance - fadeEnd) / (fadeStart - fadeEnd), 1)) * fade;
    }
    return 0;
  }

  // 🔹 Split any text into per-letter spans
  function wrapText(node) {
    if (typeof node === "string") {
      return node.split("").map((char, i) => (
        <span
          key={i}
          ref={(el) => {
            if (el) {
              const rect = el.getBoundingClientRect();
              el.style.opacity = getLetterOpacity(
                rect.left + rect.width / 2,
                rect.top + rect.height / 2
              );
            }
          }}
          style={{
            display: "inline-block",
            transition: "opacity 0.2s ease-out",
          }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ));
    }

    if (Array.isArray(node)) {
      return node.map((child, i) => <span key={i}>{wrapText(child)}</span>);
    }

    if (node && typeof node === "object" && node.props) {
      return cloneElement(node, {
        ...node.props,
        children: wrapText(node.props.children),
      });
    }

    return node;
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        background: "transparent",
        color: "white",
        textAlign: "center",
      }}
    >
      {wrapText(children)}
    </div>
  );
}
