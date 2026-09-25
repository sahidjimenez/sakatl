// Bound the entire response body as well as the initial HTTP request.
// TimeoutError is surfaced by useChat; AbortError is reserved for user stops.
export const assistantFetch: typeof fetch = async (input, init) => {
  const timeout = AbortSignal.timeout(100_000);
  const signal = init?.signal ? AbortSignal.any([init.signal, timeout]) : timeout;
  const timeoutError = () => new Error("La respuesta tardó demasiado. Intenta de nuevo.");
  try {
    const response = await fetch(input, { ...init, signal });
    if (!response.body) return response;
    const reader = response.body.getReader();
    return new Response(new ReadableStream<Uint8Array>({
      async pull(controller) {
        try {
          const { done, value } = await reader.read();
          if (done) controller.close();
          else controller.enqueue(value);
        } catch (error) {
          // Browsers can report a body timeout as AbortError, which useChat
          // deliberately ignores. Preserve timeouts as visible failures.
          controller.error(timeout.aborted ? timeoutError() : error);
        }
      },
      cancel: reason => reader.cancel(reason),
    }), { status: response.status, statusText: response.statusText, headers: response.headers });
  } catch (error) {
    throw timeout.aborted ? timeoutError() : error;
  }
};
