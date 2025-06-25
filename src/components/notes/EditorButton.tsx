import { Button } from "../ui/button"

export default function EditorButton({
  active,
  onClick,
  icon,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={active ? 'default' : 'outline'}
      className="p-2"
      onClick={onClick}
    >
      {icon}
    </Button>
  )
}