# Ashishhh Studio AI — V4 Real AI Starter

This is an independently runnable Next.js web app with server-side OpenAI API integration.

## Requirements
- Node.js 20+
- OpenAI API key with access to the selected text and image models
- Internet connection for API calls

## Run locally
1. Extract this ZIP.
2. Open a terminal in the project folder.
3. Run `npm install`.
4. Copy `.env.example` to `.env.local`.
5. Put your secret key in `.env.local` as `OPENAI_API_KEY=...`.
6. Run `npm run dev`.
7. Open `http://localhost:3000`.

## What V4 includes
- Multi-photo upload with per-photo placement instructions and ordering.
- Marathi/English brief and global creative direction.
- Server-side text generation route for design brief, three concepts, YouTube titles, tags, hashtags, Instagram caption and carousel storyboard.
- Separate image generation route that generates three background concepts from the AI-written prompts.
- Download generated images as PNG from the UI.

## Important setup and limitations
- API key is only read on the server. Never put it in browser code or commit `.env.local`.
- AI image generation is a separate API call and may incur additional usage charges.
- This starter currently sends the topic, user instructions and photo filenames/instructions to the text model. It does NOT yet send uploaded reference photo pixels to the image model, so the generated thumbnail backgrounds do not preserve or incorporate the actual uploaded photos. The UI displays uploaded photos and uses their instructions for creative planning. Next production step is image-input analysis/compositing and face-preserving image editing.
- Font choices are preferences; to guarantee Devanagari rendering, bundle the chosen licensed font files in `public/fonts` and load them with `@font-face`.
- Add authentication, rate limiting, storage, moderation, privacy/consent controls, export templates and deployment configuration before public launch.
- Default model names can be changed in `.env.local` using `OPENAI_TEXT_MODEL` and `OPENAI_IMAGE_MODEL` if your account supports different models.
