import { conectarMongoDB } from "@/middlewares/conectarMongoDB";
import { validarTokenJWT } from "@/middlewares/validarTokenJWT";
import { PublicacaoModel } from "@/models/publicacaoModel";
import { UsuarioModel } from "@/models/usuarioModel";
import { TRespostaPadrao } from "@/types/respostaPadrao";
import { NextApiRequest, NextApiResponse } from "next";

const endpointComentario = async (
  req: NextApiRequest,
  res: NextApiResponse<TRespostaPadrao | any[]>
) => {
  try {
    if (req.method === "PUT") {
      const { userId, id } = req.query;

      const usuarioLogado = await UsuarioModel.findById(userId);

      if (!usuarioLogado) {
        return res.status(400).json({ erro: "Usuário não encontrado" });
      }

      const publicacao = await PublicacaoModel.findById(id);

      if (!publicacao) {
        return res.status(400).json({ erro: "Publicação não encontrada" });
      }

      if (!req.body || !req.body.comentario || req.body.comentario.length < 2) {
        return res.status(400).json({ erro: "Comentário não é válido" });
      }

      const comentario = {
        usuarioId: usuarioLogado._id,
        nome: usuarioLogado.nome,
        comentario: req.body.comentario,
      };

      publicacao.comentarios.push(comentario);
      await PublicacaoModel.findByIdAndUpdate(
        { _id: publicacao._id },
        publicacao
      );

      return res.status(200).json({ msg: "Comentário adicionado com sucesso" });
    }

    return res.status(405).json({ erro: "Metódo informado não é válido" });
  } catch (e) {
    console.error(e);

    return res
      .status(500)
      .json({ erro: "Ocorreu um erro ao adicionar comentário" + e });
  }
};

export default validarTokenJWT(conectarMongoDB(endpointComentario));
