import * as React from "react"
import { ArrowUpRight, ArrowDownRight, Clock, Star, ShoppingCart, AlertTriangle, TrendingUp, MessageSquare, Users, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { figma } from "@/lib/figma-dev"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge, BadgeDot } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Thumbnail } from "@/components/ui/thumbnail"

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   LIST ITEM
   Reusable interactive list item for dashboards & lists.
   Layout: [Leading] — [Title + Subtitle] — [Trailing]
   5 content types, each maps to a separate Figma component.
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

type ListItemType = "order" | "product" | "user" | "transaction" | "notification"
type ListItemState = "default" | "hover"

/* ── Value types per content type ── */
type OrderValue = "image" | "fallback"
type ProductValue = "default" | "star" | "negative"
type UserValue = "image" | "fallback"
type TransactionValue = "positive" | "negative"
type NotificationValue = "unread" | "read"

interface ListItemBaseProps {
  /** Visual type — determines layout of content areas */
  type?: ListItemType
  /** Visual state (controlled preview for DS) */
  state?: ListItemState
  className?: string
}

/* ── Order Item ── */
interface OrderItemProps extends ListItemBaseProps {
  type?: "order"
  /** Value variant — Image (avatar photo) or Fallback (initials) */
  value?: OrderValue
  /** Avatar URL */
  avatarUrl?: string
  /** Avatar fallback initials */
  avatarFallback?: string
  /** Customer name */
  title: string
  /** Order ID */
  orderId?: string
  /** Time label (e.g. "2 min ago") */
  time?: string
  /** Amount (e.g. "$284.00") */
  amount?: string
  /** Status text */
  status?: string
  /** Status badge variant */
  statusVariant?: "success" | "warning" | "destructive" | "primary" | "secondary"
}

/* ── Product Item ── */
interface ProductItemProps extends ListItemBaseProps {
  type: "product"
  /** Value variant — Default, Star (top product badge), or Negative (negative growth) */
  value?: ProductValue
  /** Product image URL */
  imageUrl?: string
  /** Product name */
  title: string
  /** Sales count label (e.g. "1,842 sold") */
  sales?: string
  /** Price label (e.g. "$249.99") */
  price?: string
  /** Growth percentage (e.g. "+18.3%") */
  growth?: string
  /** Show star badge (top product) */
  showStar?: boolean
}

/* ── User Item ── */
interface UserItemProps extends ListItemBaseProps {
  type: "user"
  /** Value variant — Image (avatar photo) or Fallback (initials) */
  value?: UserValue
  /** Avatar URL */
  avatarUrl?: string
  /** Avatar fallback initials */
  avatarFallback?: string
  /** User name */
  title: string
  /** Email */
  email?: string
  /** Role label (e.g. "Admin") */
  role?: string
  /** Status text */
  status?: string
  /** Status badge variant */
  statusVariant?: "success" | "warning" | "destructive" | "primary" | "secondary"
}

/* ── Transaction Item ── */
interface TransactionItemProps extends ListItemBaseProps {
  type: "transaction"
  /** Value variant — Positive (+amount) or Negative (-amount) */
  value?: TransactionValue
  /** Leading icon element */
  icon?: React.ReactNode
  /** Transaction title */
  title: string
  /** Subtitle / description */
  subtitle?: string
  /** Amount (e.g. "+$1,200" or "-$450") */
  amount?: string
  /** Is positive amount */
  positive?: boolean
  /** Time label */
  time?: string
}

/* ── Notification Item ── */
interface NotificationItemProps extends ListItemBaseProps {
  type: "notification"
  /** Value variant — Unread (blue dot) or Read */
  value?: NotificationValue
  /** Unique id for callbacks */
  id?: string
  /** Leading icon element */
  icon?: React.ReactNode
  /** Notification title */
  title: string
  /** Description text */
  description?: string
  /** Time label */
  time?: string
  /** Unread state — shows blue dot indicator */
  unread?: boolean
  /** Notification category — determines icon color */
  category?: "order" | "warning" | "success" | "info"
  /** Click handler (e.g. mark as read) */
  onClick?: () => void
  /** Dismiss handler — shows close button */
  onDismiss?: () => void
}

type ListItemProps = OrderItemProps | ProductItemProps | UserItemProps | TransactionItemProps | NotificationItemProps

const listItemBase =
  "flex items-center gap-sm py-xs px-sm -mx-sm rounded-xl transition-colors cursor-pointer"

function ListItem(props: ListItemProps) {
  const { type = "order", state = "default", className } = props

  /* Each type maps to its own Figma component */
  const figmaComponentName =
    type === "order" ? "Order Item" :
    type === "product" ? "Product Item" :
    type === "user" ? "User Item" :
    type === "transaction" ? "Transaction Item" :
    "Notification Item"

  const figmaValue =
    type === "order" ? ((props as OrderItemProps).value === "fallback" ? "Fallback" : "Image") :
    type === "product" ? ((props as ProductItemProps).value === "star" ? "Star" : (props as ProductItemProps).value === "negative" ? "Negative" : "Default") :
    type === "user" ? ((props as UserItemProps).value === "fallback" ? "Fallback" : "Image") :
    type === "transaction" ? ((props as TransactionItemProps).value === "negative" ? "Negative" : "Positive") :
    type === "notification" ? ((props as NotificationItemProps).value === "read" ? "Read" : "Unread") :
    "Default"

  /* Notification uses a different base layout */
  if (type === "notification") {
    const np = props as NotificationItemProps
    return (
      <div
        data-slot="list-item"
        {...figma(figmaComponentName, {
          State: state === "hover" ? "Hover" : "Default",
          Value: figmaValue,
        })}
        className={cn(
          "flex items-start gap-sm px-xl py-md transition-colors hover:bg-muted dark:hover:bg-white/[0.03] group relative cursor-pointer",
          np.unread && "bg-primary-10",
          state === "hover" && "bg-muted dark:bg-white/[0.03]",
          className,
        )}
        onClick={np.onClick}
      >
        <NotificationContent {...np} />
      </div>
    )
  }

  return (
    <div
      data-slot="list-item"
      {...figma(figmaComponentName, {
        State: state === "hover" ? "Hover" : "Default",
        Value: figmaValue,
      })}
      className={cn(
        listItemBase,
        state === "hover" && "bg-muted",
        className,
      )}
    >
      {type === "order" && <OrderContent {...(props as OrderItemProps)} />}
      {type === "product" && <ProductContent {...(props as ProductItemProps)} />}
      {type === "user" && <UserContent {...(props as UserItemProps)} />}
      {type === "transaction" && <TransactionContent {...(props as TransactionItemProps)} />}
    </div>
  )
}

/* ── Order layout ── */
function OrderContent({
  avatarUrl, avatarFallback = "?", title, orderId, time, amount, status, statusVariant = "secondary",
}: OrderItemProps) {
  return (
    <>
      <Avatar className="size-[38px] ring-1 ring-border shrink-0">
        {avatarUrl && <AvatarImage src={avatarUrl} alt={title} />}
        <AvatarFallback>{avatarFallback}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="sp-body-semibold text-foreground truncate">{title}</p>
        {(orderId || time) && (
          <div className="flex items-center gap-2xs mt-3xs">
            {orderId && <span className="sp-data-sm text-muted-foreground">{orderId}</span>}
            {orderId && time && <span className="text-muted-foreground">&middot;</span>}
            {time && (
              <>
                <Clock className="size-[11px] text-muted-foreground" />
                <span className="sp-data-sm text-muted-foreground">{time}</span>
              </>
            )}
          </div>
        )}
      </div>
      {(amount || status) && (
        <div className="flex flex-col items-end gap-2xs shrink-0">
          {amount && <span className="sp-data text-foreground font-medium">{amount}</span>}
          {status && (
            <Badge variant={statusVariant} level="secondary" size="sm">
              {status}
            </Badge>
          )}
        </div>
      )}
    </>
  )
}

/* ── Product layout ── */
function ProductContent({
  imageUrl, title, sales, price, growth, showStar,
}: ProductItemProps) {
  const isPositive = growth ? growth.startsWith("+") : true
  return (
    <>
      <div className="relative shrink-0">
        <Thumbnail type="image" size="default" src={imageUrl} alt={title} />
        {showStar && (
          <div className="absolute top-0 right-0 size-[16px] rounded-bl-md rounded-tr-lg bg-warning flex items-center justify-center">
            <Star className="size-[9px] text-primary-foreground fill-primary-foreground" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="sp-body-medium text-foreground truncate">{title}</p>
        {(sales || price) && (
          <div className="flex items-center gap-2xs">
            {sales && <span className="sp-data-sm text-muted-foreground">{sales}</span>}
            {sales && price && <span className="text-muted-foreground">&middot;</span>}
            {price && <span className="sp-data-sm text-muted-foreground">{price}</span>}
          </div>
        )}
      </div>
      {growth && (
        <div className="flex items-center gap-3xs shrink-0">
          {isPositive
            ? <ArrowUpRight className="size-[12px] text-success" />
            : <ArrowDownRight className="size-[12px] text-destructive" />
          }
          <span className={cn("sp-data-sm", isPositive ? "text-success" : "text-destructive")}>{growth}</span>
        </div>
      )}
    </>
  )
}

/* ── User layout ── */
function UserContent({
  avatarUrl, avatarFallback = "?", title, email, role, status, statusVariant = "secondary",
}: UserItemProps) {
  return (
    <>
      <Avatar className="size-[36px] ring-1 ring-ring shrink-0">
        {avatarUrl && <AvatarImage src={avatarUrl} alt={title} />}
        <AvatarFallback>{avatarFallback}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="sp-body-semibold text-foreground truncate">{title}</p>
        {email && <p className="sp-caption text-muted-foreground truncate">{email}</p>}
      </div>
      <div className="flex items-center gap-sm shrink-0">
        {role && <Badge variant="outline" size="sm">{role}</Badge>}
        {status && (
          <Badge variant={statusVariant} level="secondary" size="sm">
            {status}
          </Badge>
        )}
      </div>
    </>
  )
}

/* ── Transaction layout ── */
function TransactionContent({
  icon, title, subtitle, amount, positive = true, time,
}: TransactionItemProps) {
  return (
    <>
      {icon && (
        <Thumbnail type="icon" size="default" icon={icon} />
      )}
      <div className="flex-1 min-w-0">
        <p className="sp-body-medium text-foreground truncate">{title}</p>
        {subtitle && <p className="sp-caption text-muted-foreground truncate">{subtitle}</p>}
      </div>
      <div className="flex flex-col items-end gap-2xs shrink-0">
        {amount && (
          <span className={cn("sp-data font-medium", positive ? "text-success" : "text-foreground")}>
            {amount}
          </span>
        )}
        {time && <span className="sp-data-sm text-muted-foreground">{time}</span>}
      </div>
    </>
  )
}

/* ── Notification layout ── */
const notifCategoryThumbnailColor: Record<string, "primary" | "warning" | "success" | "default"> = {
  order: "primary",
  warning: "warning",
  success: "success",
  info: "default",
}

function NotificationContent({
  icon, title, description, time, unread = false, category = "info", onDismiss,
}: NotificationItemProps) {
  return (
    <>
      {/* Thumbnail with unread dot centered to it */}
      <div className="relative shrink-0 self-start mt-4xs">
        {unread && (
          <BadgeDot size="sm" className="absolute -left-md top-1/2 -translate-y-1/2" />
        )}
        <Thumbnail
          type="icon"
          size="sm"
          color={notifCategoryThumbnailColor[category] ?? "default"}
          icon={icon || <MessageSquare className="size-[15px]" />}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("sp-body-medium text-foreground truncate", unread && "font-semibold")}>{title}</p>
        {description && <p className="sp-caption text-muted-foreground truncate mt-px">{description}</p>}
        {time && <p className="sp-caption text-muted-foreground mt-2xs">{time}</p>}
      </div>
      {onDismiss && (
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={(e) => { e.stopPropagation(); onDismiss() }}
          className="shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-white/[0.06] opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="size-[12px]" />
        </Button>
      )}
    </>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ITEM LIST
   Container for a group of ListItems with header.
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

interface ItemListProps {
  children: React.ReactNode
  className?: string
}

function ItemList({ children, className }: ItemListProps) {
  return (
    <div
      data-slot="item-list"
      {...figma("Item List")}
      className={cn("flex flex-col", className)}
    >
      {children}
    </div>
  )
}

export { ListItem, ItemList }
export type {
  ListItemProps, ListItemType, ListItemState,
  OrderValue, ProductValue, UserValue, TransactionValue, NotificationValue,
  OrderItemProps, ProductItemProps, UserItemProps, TransactionItemProps, NotificationItemProps,
}
