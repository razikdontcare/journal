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
