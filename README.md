# Journal

A personal journal built with React Router.

**Demo:** https://journal.razik.net

## Tech Stack

- [React Router](https://reactrouter.com/) - Full-stack React framework
- [Bun](https://bun.sh/) - Package manager
- [Node.js](https://nodejs.org/) - Runtime
- [Drizzle](https://orm.drizzle.team/) - TypeScript ORM
- [Tiptap](https://tiptap.dev/) - Rich text editor
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Better Auth](https://www.better-auth.com/) - Authentication
- [S3](https://aws.amazon.com/s3/) - Image storage

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `BETTER_AUTH_URL` | Base URL for authentication | Yes |
| `BETTER_AUTH_SECRET` | Secret key for auth sessions | Yes |
| `S3_ENDPOINT` | S3-compatible storage endpoint | Yes |
| `S3_BUCKET_NAME` | S3 bucket name | Yes |
| `S3_ACCESS_KEY_ID` | S3 access key | Yes |
| `S3_SECRET_ACCESS_KEY` | S3 secret key | Yes |
| `S3_REGION` | S3 region | No |
| `S3_PUBLIC_URL` | Public URL for uploaded files | No |
| `S3_FORCE_PATH_STYLE` | Use path-style URLs | No |
| `S3_BUCKET_ENDPOINT` | Treat endpoint as bucket URL | No |
| `SITE_URL` | Public site URL for SEO | No |
| `PORT` | Server port (default: 3000) | No |

## Routes

| Path | Description |
|------|-------------|
| `/` | Home page |
| `/about` | About page |
| `/articles` | Articles listing |
| `/article/:slug` | Single article view |
| `/login` | Login page |
| `/register` | Registration page |
| `/admin` | Admin dashboard |
| `/admin/new` | Create new article |
| `/admin/edit/:id` | Edit article |
| `/admin/media` | Media library |
| `/admin/users` | User management |
| `/admin/profile` | User profile settings |
| `/admin/settings` | Site settings |
| `/api/upload` | Image upload endpoint (POST) |

## Development

```bash
bun install
bun run dev
```

## Production

```bash
bun run build
bun run start
```

## Docker

```bash
docker build -t journal .
docker run -p 3000:3000 journal
```

Or pull from GHCR:

```bash
docker pull ghcr.io/razikdontcare/journal:latest
```

## License

MIT
