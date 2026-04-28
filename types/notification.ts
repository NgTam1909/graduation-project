import { ActivityLog } from "@/types/activity-log"

export type NotificationItem = ActivityLog & {
    type?: "activity" | "mention"
}
