# 🧘 Zennote - Paste. Beautify. Share.

*Zennote turns messy AI markdown into beautiful, shareable notes — instantly.*

---

## 🌟 What is Zennote?

Zennote is a markdown beautifier built for the modern age of AI and instant sharing.  
It takes unstructured markdown (often copied from AI tools), beautifies it with a clean design, and gives you a shareable URL — all in seconds.

Perfect for:
- Sharing AI responses or dev notes
- Creating clean, shareable docs from markdown
- Personal knowledge management

---

## 🛠️ Tech Stack

| Layer      | Tech                            |
|------------|---------------------------------|
| Frontend   | [Next.js 15](https://nextjs.org/) + Tailwind CSS |
| Backend    | [Cloudflare Workers](https://workers.cloudflare.com/) (TypeScript) |
| Storage    | [Cloudflare R2](https://developers.cloudflare.com/r2/) for markdown blobs |
| DB         | [Cloudflare D1 / R1](https://developers.cloudflare.com/d1/) for metadata |
| Deployment | Cloudflare Pages & Workers via Wrangler |

---

## 🧭 Project Structure

```
zennote/
├── apps/
│   ├── backend/       # Cloudflare Worker logic
│   │   ├── src/       # Worker source code (index.ts)
│   │   └── migrations/ # DB migrations (D1/R1)
│   └── frontend/      # Next.js app
│       └── src/       # App Router setup, components, libs, config
├── .gitignore
├── LICENSE
└── README.md
```

---

## 🚀 Deployment & Hosting

Zennote uses **Cloudflare’s full stack** for hosting:

- **Frontend** is deployed using [Cloudflare Pages](https://pages.cloudflare.com/)
- **Backend API** is a Cloudflare Worker deployed via `wrangler`
- **R2** stores the actual markdown files (blobs)
- **D1 (R1)** stores metadata like slugs, titles, and timestamps

You can find `wrangler.toml` in `apps/backend/`.

---

## 🧪 Local Development

```bash
# Clone the repo
git clone https://github.com/your-username/zennote.git
cd zennote

# Frontend setup
cd apps/frontend
npm install
npm run dev

# Backend setup (requires wrangler)
cd ../backend
npm install
wrangler dev
```

> Make sure to set up `.env` for frontend & bind R2/D1 vars in `wrangler.toml`.

---

## 🧑‍💻 Contributing

Contributions are welcome! Here’s how to get started:

1. 🍴 Fork this repo
2. 👯 Clone your fork
3. 💡 Create a feature branch: `git checkout -b my-feature`
4. 🧪 Make changes & test them
5. 📬 Open a PR with a clear title and description

### Guidelines

- Follow existing project structure
- Format code using Prettier (`.prettierrc`)
- Keep commits clean and meaningful
- Don’t commit secrets or `.env` files

---

## 💬 Feedback & Ideas

Open an issue or start a discussion! Whether it's a bug, feature idea, or random thought — we'd love to hear it.

---

## 📄 License

MIT License.  
Feel free to use, remix, or extend Zennote. Just don’t be evil 🙃

---

Made with ☕ + 💭 by [Shivansh Karan](https://shivanshkaran.tech)
