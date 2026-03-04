import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio"

/**
 * SprouX Aspect Ratio
 *
 * Figma: [SprouX - DS] Foundation & Component
 *
 * Constrains child content to a specified aspect ratio.
 * Built on Radix Aspect Ratio.
 */
function AspectRatio(
  props: React.ComponentProps<typeof AspectRatioPrimitive.Root>
) {
  return <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props} />
}

export { AspectRatio }
