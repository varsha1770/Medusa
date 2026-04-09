import {
  defineMiddlewares,
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

function disableResponseCaching(
  _req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  // Prevent stale auth/session and admin API responses after login/logout.
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
  res.setHeader("Pragma", "no-cache")
  res.setHeader("Expires", "0")
  res.setHeader("Surrogate-Control", "no-store")
  next()
}

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/*",
      middlewares: [disableResponseCaching],
    },
    {
      matcher: "/auth/*",
      middlewares: [disableResponseCaching],
    },
    {
      matcher: "/store/*",
      middlewares: [disableResponseCaching],
    },
  ],
})
