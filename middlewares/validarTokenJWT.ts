import { TRespostaPadrao } from "@/types/respostaPadrao";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import jwt, { JsonWebTokenError, JwtPayload } from "jsonwebtoken";

export const validarTokenJWT =
  (handler: NextApiHandler) =>
  async (req: NextApiRequest, res: NextApiResponse<TRespostaPadrao>) => {
    const { SECRET_KEY } = process.env;

    if (!SECRET_KEY) {
      return res.status(500).json({ erro: "ENV Jwt não foi informada" });
    }

    if (!req || !req.headers) {
      return res.status(401).json({ erro: "Não foi possível validar o token" });
    }

    if (req.method !== "OPTIONS") {
      const authorization = req.headers["authorization"];

      if (!authorization) {
        return res
          .status(401)
          .json({ erro: "Não foi possível validar o token" });
      }

      const token = authorization.substring(7);

      if (!token || token === "undefined") {
        return res
          .status(401)
          .json({ erro: "Não foi possível validar o token" });
      }

      try {
        const decoded = jwt.verify(token, SECRET_KEY) as JwtPayload;

        if (!decoded) {
          return res
            .status(401)
            .json({ erro: "Não foi possível validar o token" });
        }

        if (!req.query) {
          req.query = {};
        }

        req.query.userId = decoded._id;
      } catch (error) {
        if (error instanceof JsonWebTokenError) {
          return res.status(401).json({ erro: error.message });
        }

        return res
          .status(401)
          .json({ erro: "Não foi possível validar o token" });
      }
    }

    return handler(req, res);
  };
