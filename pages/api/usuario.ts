import { conectarMongoDB } from "@/middlewares/conectarMongoDB";
import { validarTokenJWT } from "@/middlewares/validarTokenJWT";
import { UsuarioModel } from "@/models/usuarioModel";
import { TRespostaPadrao } from "@/types/respostaPadrao";
import { NextApiRequest, NextApiResponse } from "next";

const endpointUsuario = async (
  req: NextApiRequest,
  res: NextApiResponse<TRespostaPadrao | any>
) => {
  try {
    const { userId } = req?.query;

    const usuario = await UsuarioModel.findById(userId);
    usuario.senha = null;

    return res.status(200).json(usuario);
  } catch (e) {
    console.error(e);
  }

  return res
    .status(400)
    .json({ erro: "Não foi possível obter dados do usuário" });
};

export default validarTokenJWT(conectarMongoDB(endpointUsuario));
