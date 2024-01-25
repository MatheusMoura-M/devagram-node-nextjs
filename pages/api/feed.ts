import { conectarMongoDB } from "@/middlewares/conectarMongoDB";
import { politicaCORS } from "@/middlewares/politicaCORS";
import { validarTokenJWT } from "@/middlewares/validarTokenJWT";
import { PublicacaoModel } from "@/models/publicacaoModel";
import { SeguidorModel } from "@/models/seguidorModel";
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
      } else {
        const { userId } = req?.query;
        const usuarioLogado = await UsuarioModel.findById(userId);

        if (!usuarioLogado) {
          res.status(400).json({ erro: "Usuário não encontrado" });
        }

        const seguidores = await SeguidorModel.find({
          usuarioId: usuarioLogado._id,
        });

        const seguidoresIds = seguidores.map((s) => s.usuarioSeguidoId);

        const publicacoes = await PublicacaoModel.find({
          $or: [{ idUsuario: usuarioLogado._id }, { idUsuario: seguidoresIds }],
        }).sort({ data: -1 });

        const result = [];

        for (const publicacao of publicacoes) {
          const usuarioDaPublicacao = await UsuarioModel.findById(
            publicacao.idUsuario
          );

          if (usuarioDaPublicacao) {
            const final = {
              ...publicacao._doc,
              usuario: {
                nome: usuarioDaPublicacao.nome,
                avatar: usuarioDaPublicacao.avatar,
              },
            };

            result.push(final);
          }
        }

        return res.status(200).json(result);
      }
    }

    return res.status(405).json({ erro: "Metódo informado não é válido" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ erro: "Não foi possível obter o feed" });
  }
};

export default politicaCORS(validarTokenJWT(conectarMongoDB(endpointFeed)));
