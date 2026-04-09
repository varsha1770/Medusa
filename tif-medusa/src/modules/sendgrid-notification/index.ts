import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import { SendgridNotificationService } from "./services"

/**
 * Module Provider Export for Medusa Notification Module
 * This exports the SendGrid notification provider to be registered with Medusa's
 * notification system. The provider will be instantiated and managed by Medusa's
 * module container.
 */
export default ModuleProvider(Modules.NOTIFICATION, {
  services: [SendgridNotificationService],
})
