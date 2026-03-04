import * as React from "react"
import * as MenubarPrimitive from "@radix-ui/react-menubar"
import { Check, ChevronRight, Circle } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * SprouX Menubar
 *
 * Figma: N/A (code-only component, not in Figma design file)
 *
 * Horizontal menu bar with dropdown menus.
 * Built on Radix Menubar — pattern matches DropdownMenu and ContextMenu.
 */
function Menubar({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Root>) {
  return (
    <MenubarPrimitive.Root
      data-slot="menubar"
      className={cn(
        "flex h-9 items-center gap-3xs rounded-md border border-border bg-background p-3xs shadow-xs",
        className
      )}
      {...props}
    />
  )
}

function MenubarMenu(
  props: React.ComponentProps<typeof MenubarPrimitive.Menu>
) {
  return <MenubarPrimitive.Menu data-slot="menubar-menu" {...props} />
}

function MenubarGroup(
  props: React.ComponentProps<typeof MenubarPrimitive.Group>
) {
  return <MenubarPrimitive.Group data-slot="menubar-group" {...props} />
}

function MenubarPortal(
  props: React.ComponentProps<typeof MenubarPrimitive.Portal>
) {
  return <MenubarPrimitive.Portal data-slot="menubar-portal" {...props} />
}

function MenubarRadioGroup(
  props: React.ComponentProps<typeof MenubarPrimitive.RadioGroup>
) {
  return (
    <MenubarPrimitive.RadioGroup data-slot="menubar-radio-group" {...props} />
  )
}

function MenubarSub(
  props: React.ComponentProps<typeof MenubarPrimitive.Sub>
) {
  return <MenubarPrimitive.Sub data-slot="menubar-sub" {...props} />
}

function MenubarTrigger({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Trigger>) {
  return (
    <MenubarPrimitive.Trigger
      data-slot="menubar-trigger"
      className={cn(
        "flex items-center rounded-sm px-xs py-2xs typo-paragraph-sm-bold outline-none select-none focus:bg-muted focus:text-foreground data-[state=open]:bg-muted data-[state=open]:text-foreground",
        className
      )}
      {...props}
    />
  )
}

function MenubarContent({
  className,
  align = "start",
  alignOffset = -4,
  sideOffset = 8,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Content>) {
  return (
    <MenubarPortal>
      <MenubarPrimitive.Content
        data-slot="menubar-content"
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-[12rem] overflow-hidden rounded-md border border-border bg-card p-1 text-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        {...props}
      />
    </MenubarPortal>
  )
}

function MenubarItem({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Item> & {
  inset?: boolean
}) {
  return (
    <MenubarPrimitive.Item
      data-slot="menubar-item"
      className={cn(
        "relative flex cursor-default select-none items-center gap-2 rounded-sm px-xs py-2xs typo-paragraph-sm outline-none transition-colors focus:bg-muted focus:text-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-md [&_svg]:shrink-0",
        inset && "pl-2xl",
        className
      )}
      {...props}
    />
  )
}

function MenubarCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.CheckboxItem>) {
  return (
    <MenubarPrimitive.CheckboxItem
      data-slot="menubar-checkbox-item"
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm py-2xs pl-2xl pr-xs typo-paragraph-sm outline-none transition-colors focus:bg-muted focus:text-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="absolute left-xs flex size-3.5 items-center justify-center">
        <MenubarPrimitive.ItemIndicator>
          <Check className="size-md" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.CheckboxItem>
  )
}

function MenubarRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.RadioItem>) {
  return (
    <MenubarPrimitive.RadioItem
      data-slot="menubar-radio-item"
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm py-2xs pl-2xl pr-xs typo-paragraph-sm outline-none transition-colors focus:bg-muted focus:text-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      <span className="absolute left-xs flex size-3.5 items-center justify-center">
        <MenubarPrimitive.ItemIndicator>
          <Circle className="size-xs fill-current" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.RadioItem>
  )
}

function MenubarLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Label> & {
  inset?: boolean
}) {
  return (
    <MenubarPrimitive.Label
      data-slot="menubar-label"
      className={cn(
        "px-xs py-2xs typo-paragraph-sm-bold",
        inset && "pl-2xl",
        className
      )}
      {...props}
    />
  )
}

function MenubarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Separator>) {
  return (
    <MenubarPrimitive.Separator
      data-slot="menubar-separator"
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

function MenubarShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="menubar-shortcut"
      className={cn(
        "ml-auto typo-paragraph-mini tracking-widest text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function MenubarSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.SubTrigger> & {
  inset?: boolean
}) {
  return (
    <MenubarPrimitive.SubTrigger
      data-slot="menubar-sub-trigger"
      className={cn(
        "flex cursor-default select-none items-center gap-2 rounded-sm px-xs py-2xs typo-paragraph-sm outline-none focus:bg-muted focus:text-foreground data-[state=open]:bg-muted data-[state=open]:text-foreground [&_svg]:pointer-events-none [&_svg]:size-md [&_svg]:shrink-0",
        inset && "pl-2xl",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRight className="ml-auto" />
    </MenubarPrimitive.SubTrigger>
  )
}

function MenubarSubContent({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.SubContent>) {
  return (
    <MenubarPrimitive.SubContent
      data-slot="menubar-sub-content"
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-card p-1 text-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  )
}

export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarCheckboxItem,
  MenubarRadioItem,
  MenubarLabel,
  MenubarSeparator,
  MenubarShortcut,
  MenubarGroup,
  MenubarPortal,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
  MenubarRadioGroup,
}
