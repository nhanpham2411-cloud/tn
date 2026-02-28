import { useParams } from "react-router-dom"

export default function UserProfilePage() {
  const { id } = useParams()
  return (
    <div>
      <h1 className="typo-heading-2 text-foreground">User Profile</h1>
      <p className="typo-paragraph-reg text-muted-foreground">User ID: {id}</p>
    </div>
  )
}
