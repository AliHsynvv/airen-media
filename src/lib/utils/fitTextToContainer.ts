export function fitTextToContainer(
  el: HTMLElement | null,
  opts: { minPx?: number; stepPx?: number } = {}
) {
  if (!el) return
  const { minPx = 14, stepPx = 0.5 } = opts
  const parent = el.parentElement
  if (!parent) return

  // Ensure single-line for measurement
  el.style.whiteSpace = 'nowrap'
  const cs = window.getComputedStyle(el)
  let size = parseFloat(cs.fontSize || '16')

  // Shrink in small steps until the text fits or we hit minimum
  // Guard rails to avoid long loops
  let safety = 200
  while (size > minPx && el.scrollWidth > parent.clientWidth && safety-- > 0) {
    size -= stepPx
    el.style.fontSize = `${size}px`
  }
}


