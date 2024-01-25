import { conectarMongoDB } from "@/middlewares/conectarMongoDB";
import { politicaCORS } from "@/middlewares/politicaCORS";
import { validarTokenJWT } from "@/middlewares/validarTokenJWT";
import { PublicacaoModel } from "@/models/publicacaoModel";
import { UsuarioModel } from "@/models/usuarioModel";
import { TRespostaPadrao } from "@/types/respostaPadrao";
import { NextApiRequest, NextApiResponse } from "next";

const endpointLike = async (
  req: NextApiRequest,
  res: NextApiResponse<TRespostaPadrao | any[]>
) => {
  try {
    if (req.method === "PUT") {
      const { userId, id } = req.query;

      const usuario = await UsuarioModel.findById(userId);

      if (!usuario) {
        return res.status(400).json({ erro: "Usuário não encontrado" });
      }

      const publicacao = await PublicacaoModel.findById(id);

      if (!publicacao) {
        return res.status(400).json({ erro: "Publicação não encontrada" });
      }

      const indexDoUsuarioNoLike = publicacao.likes.findIndex(
        (e: any) => e.toString() === usuario._id.toString()
      );

      if (indexDoUsuarioNoLike !== -1) {
        publicacao.likes.splice(indexDoUsuarioNoLike, 1);

        await PublicacaoModel.findByIdAndUpdate(
          { _id: publicacao._id },
          publicacao
        );

        return res
          .status(200)
          .json({ erro: "Publicação descurtida com sucesso" });
      } else {
        publicacao.likes.push(usuario._id);

        await PublicacaoModel.findByIdAndUpdate(
          { _id: publicacao._id },
          publicacao
        );

        return res.status(200).json({ erro: "Publicação curtida com sucesso" });
      }
    }

    return res.status(405).json({ erro: "Metódo informado não é válido" });
  } catch (e) {
    console.error(e);

    return res
      .status(500)
      .json({ erro: "Ocorreu um erro ao curtir/descurtir uma publicação" + e });
  }
};

export default politicaCORS(validarTokenJWT(conectarMongoDB(endpointLike)));
