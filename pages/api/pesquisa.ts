import { conectarMongoDB } from "@/middlewares/conectarMongoDB";
import { validarTokenJWT } from "@/middlewares/validarTokenJWT";
import { UsuarioModel } from "@/models/usuarioModel";
import { TRespostaPadrao } from "@/types/respostaPadrao";
import { NextApiRequest, NextApiResponse } from "next";

const endpointPesquisa = async (
  req: NextApiRequest,
  res: NextApiResponse<TRespostaPadrao | any[]>
) => {
  try {
    if (req.method === "GET") {
      const { filtro } = req.query;

      if (!filtro || filtro.length < 2) {
        return res
          .status(405)
          .json({ erro: "Informar pelo menos 2 caracteres" });
      }

      const usuariosEncontrados = await UsuarioModel.find({
        $or: [
          { nome: { $regex: filtro, $options: "i" } },
          { email: { $regex: filtro, $options: "i" } },
        ],
      });

      return res.status(200).json(usuariosEncontrados);
    }

    return res.status(405).json({ erro: "Metódo informado não é válido" });
  } catch (e) {
    console.error(e);

    return res
      .status(500)
      .json({ erro: "Não foi possível buscar os usuários" + e });
  }
};

export default validarTokenJWT(conectarMongoDB(endpointPesquisa));
