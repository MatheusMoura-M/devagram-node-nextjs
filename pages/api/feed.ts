import { conectarMongoDB } from "@/middlewares/conectarMongoDB";
import { validarTokenJWT } from "@/middlewares/validarTokenJWT";
import { PublicacaoModel } from "@/models/publicacaoModel";
import { UsuarioModel } from "@/models/usuarioModel";
import { TRespostaPadrao } from "@/types/respostaPadrao";
import { NextApiRequest, NextApiResponse } from "next";

const endpointFeed = async (
  req: NextApiRequest,
  res: NextApiResponse<TRespostaPadrao | any>
) => {
  try {
    if (req.method === "GET") {
      if (req?.query?.id) {
        const userId = req?.query?.id;
        const usuario = await UsuarioModel.findById(userId);

        if (!usuario) {
          res.status(400).json({ erro: "Usuário não encontrado" });
        }

        const publicacoes = await PublicacaoModel.find({
          idUsuario: usuario._id,
        }).sort({ data: -1 });

        return res.status(200).json(publicacoes);
      }

      return res.status(400).json({ erro: "Id do usuário não foi informado" });
    }

    return res.status(405).json({ erro: "Metódo informado não é válido" });
  } catch (e) {
    console.error(e);
  }

  return res.status(400).json({ erro: "Não foi possível obter o feed" });
};

export default validarTokenJWT(conectarMongoDB(endpointFeed));
