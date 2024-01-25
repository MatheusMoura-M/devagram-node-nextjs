import { TRespostaPadrao } from "@/types/respostaPadrao";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import NextCors from "nextjs-cors";

export const politicaCORS =
  (handler: NextApiHandler) =>
  async (req: NextApiRequest, res: NextApiResponse<TRespostaPadrao>) => {
    try {
      await NextCors(req, res, {
        origin: "*",
        methods: ["POST", "PUT", "GET"],
        optionsSuccessStatus: 200, // Navegadores antigos dão problemas quando retornam 204
      });

      return handler(req, res);
    } catch (e) {
      console.error("Erro ao tratar a politica de CORS" + e);

      return res
        .status(500)
        .json({ erro: "Ocorreu um erro ao tratar a politica de CORS." });
    }
  };
