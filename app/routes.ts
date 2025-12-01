import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("article/:slug", "routes/article.tsx"),
  route("about", "routes/about.tsx"),
  // Auth Routes
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),
  // CMS Routes
  route("admin", "routes/admin.tsx"),
  route("admin/new", "routes/admin.new.tsx"),
  route("admin/edit/:id", "routes/admin.edit.$id.tsx"),
  route("admin/settings", "routes/admin.settings.tsx"),
] satisfies RouteConfig;
