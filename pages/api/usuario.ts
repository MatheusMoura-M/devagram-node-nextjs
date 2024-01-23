import { validarTokenJWT } from "@/middlewares/validarTokenJWT";
import { TRespostaPadrao } from "@/types/respostaPadrao";
import { NextApiRequest, NextApiResponse } from "next";

const endpointUsuario = (
  req: NextApiRequest,
  res: NextApiResponse<TRespostaPadrao>
) => {
  res.status(200).json({ msg: "Usuário autenticado com sucesso" });
};

export default validarTokenJWT(endpointUsuario);
