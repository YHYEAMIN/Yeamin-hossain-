# AI Admin Assistant

The admin panel now includes `/admin/ai` and `/api/admin/ai`.

Set these environment variables in `.env.local` or your deployment environment:

```env
OPENAI_API_KEY=your_api_key
OPENAI_MODEL=gpt-5
```

The key stays server-side. The AI endpoint requires the existing admin session and sends current dashboard/courier statistics to the OpenAI Responses API. The request uses `store: false`.

OpenAI's current JavaScript quickstart documents the Responses API and server-side API-key usage: https://platform.openai.com/docs/quickstart/make-your-first-api-request
