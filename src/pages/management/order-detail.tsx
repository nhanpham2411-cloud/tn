import { useParams } from "react-router-dom"

export default function OrderDetailPage() {
  const { id } = useParams()
  return (
    <div>
      <h1 className="typo-heading-2 text-foreground">Order Detail</h1>
      <p className="typo-paragraph-reg text-muted-foreground">Order ID: {id}</p>
    </div>
  )
}
