type RouteParams = {
  id?: string;
};

export type IdRouteContext = {
  params?: RouteParams | Promise<RouteParams>;
};

export async function getRouteIdFromContext(
  request: Request,
  context: IdRouteContext,
  terminalSegment: string,
): Promise<string> {
  try {
    const params = context.params ? await context.params : undefined;

    if (params?.id) {
      return params.id;
    }

    const segments = new URL(request.url).pathname.split("/").filter(Boolean);
    const terminalIndex = segments.lastIndexOf(terminalSegment);

    if (terminalIndex > 0) {
      return segments[terminalIndex - 1] ?? "";
    }

    return "";
  } catch (error: unknown) {
    return "";
  }
}
