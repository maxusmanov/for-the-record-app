// The Bokeh light colors, so placeholders feel like part of the background.
const colors = ["#e05aa8", "#3b5bff", "#c98a3a", "#8a5ad6"];

// Picks a gradient from the id, so the same item always gets the same one.
export function placeholderGradient(id: string) {
  const sum = [...id].reduce((total, char) => total + char.charCodeAt(0), 0);
  const from = colors[sum % colors.length];
  const to = colors[(sum + 1) % colors.length];
  return `linear-gradient(135deg, ${from}, ${to})`;
}
