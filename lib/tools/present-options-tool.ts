import { tool } from "ai";
import { z } from "zod";

export const presentOptionsTool = tool({
  description:
    "Cuando necesites que el usuario elija entre un puñado de opciones concretas (ej. objetivo: " +
    "fuerza, resistencia o acondicionamiento general), usa esta herramienta en vez de escribir las " +
    "opciones como texto plano. El usuario las va a ver como botones y al tocar una te va a llegar " +
    "su texto como si lo hubiera escrito.",
  inputSchema: z.object({
    options: z
      .array(z.string().min(1).max(80))
      .min(2)
      .max(6)
      .describe("Las opciones entre las que puede elegir, como texto corto y claro"),
  }),
  execute: async (input) => input,
});
