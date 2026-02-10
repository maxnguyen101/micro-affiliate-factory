export default {
  async fetch(request, env) {
    if (!env.ASSETS || typeof env.ASSETS.fetch !== "function") {
      return new Response("Static assets not bound. Check wrangler assets config.", { status: 500 });
    }
    return env.ASSETS.fetch(request);
  },
};
