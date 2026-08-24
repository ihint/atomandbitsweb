const SOURCE_HOST = "www.claimsnative.com";
const CANONICAL_HOST = "claimsnative.com";

export default {
  fetch(request) {
    const url = new URL(request.url);

    if (url.hostname !== SOURCE_HOST) {
      return new Response("Not found", { status: 404 });
    }

    url.protocol = "https:";
    url.hostname = CANONICAL_HOST;
    url.port = "";

    return Response.redirect(url.toString(), 301);
  },
};
