import { conectarMongoDB } from "@/middlewares/conectarMongoDB";
import { politicaCORS } from "@/middlewares/politicaCORS";
import { validarTokenJWT } from "@/middlewares/validarTokenJWT";
import { SeguidorModel } from "@/models/seguidorModel";
import { UsuarioModel } from "@/models/usuarioModel";
import { TRespostaPadrao } from "@/types/respostaPadrao";
import { NextApiRequest, NextApiResponse } from "next";

const endpointSeguir = async (
  req: NextApiRequest,
  res: NextApiResponse<TRespostaPadrao | any[]>
) => {
  try {
    if (req.method === "PUT") {
      const { userId, id } = req?.query;

      const usuarioLogado = await UsuarioModel.findById(userId);

      if (!usuarioLogado) {
        return res.status(400).json({ erro: "Usuário logado não encontrado" });
      }

      const usuarioASerSeguido = await UsuarioModel.findById(id);

      if (!usuarioASerSeguido) {
        return res
          .status(400)
          .json({ erro: "Usuário a ser seguido não encontrado" });
      }

      const euJaSigoEsseUsuario = await SeguidorModel.find({
        usuarioId: usuarioLogado._id,
        usuarioSeguidoId: usuarioASerSeguido._id,
      });

      if (euJaSigoEsseUsuario && euJaSigoEsseUsuario.length > 0) {
        euJaSigoEsseUsuario.forEach(
          async (e) => await SeguidorModel.findByIdAndDelete({ _id: e._id })
        );

        usuarioLogado.seguindo--;
        await UsuarioModel.findByIdAndUpdate(
          { _id: usuarioLogado._id },
          usuarioLogado
        );

        usuarioASerSeguido.seguidores--;
        await UsuarioModel.findByIdAndUpdate(
          { _id: usuarioASerSeguido._id },
          usuarioASerSeguido
        );

        return res
          .status(200)
          .json({ erro: "Deixou de seguir o usuário com sucesso" });
      } else {
        const seguidor = {
          usuarioId: usuarioLogado._id,
          usuarioSeguidoId: usuarioASerSeguido._id,
        };

        await SeguidorModel.create(seguidor);

        usuarioLogado.seguindo++;
        await UsuarioModel.findByIdAndUpdate(
          { _id: usuarioLogado._id },
          usuarioLogado
        );

        usuarioASerSeguido.seguidores++;
        await UsuarioModel.findByIdAndUpdate(
          { _id: usuarioASerSeguido._id },
          usuarioASerSeguido
        );

        return res.status(200).json({ erro: "Usuário seguido com sucesso" });
      }
    }

    return res.status(405).json({ erro: "Metódo informado não é válido" });
  } catch (e) {
    console.error(e);

    return res.status(500).json({
      erro: "Ocorreu um erro ao seguir/desseguir o usuário informado" + e,
    });
  }
};

export default politicaCORS(validarTokenJWT(conectarMongoDB(endpointSeguir)));
