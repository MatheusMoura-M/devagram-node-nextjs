import { conectarMongoDB } from "@/middlewares/conectarMongoDB";
import { UsuarioModel } from "@/models/usuarioModel";
import { TLoginResponse } from "@/types/loginResponse";
import { TRespostaPadrao } from "@/types/respostaPadrao";
import jwt from "jsonwebtoken";
import md5 from "md5";
import type { NextApiRequest, NextApiResponse } from "next";

const endpointLogin = async (
  req: NextApiRequest,
  res: NextApiResponse<TRespostaPadrao | TLoginResponse>
) => {
  const { SECRET_KEY } = process.env;

  if (!SECRET_KEY) {
    return res.status(500).json({ erro: "ENV Jwt não foi informada" });
  } else if (req.method === "POST") {
    const { email, senha } = req.body;

    const usuarioEncontrado = await UsuarioModel.findOne({
      email: email,
      senha: md5(senha),
    });

    if (usuarioEncontrado) {
      const token = jwt.sign({ _id: usuarioEncontrado._id }, SECRET_KEY);

      return res.status(200).json({
        nome: usuarioEncontrado.nome,
        email: usuarioEncontrado.email,
        token: token,
      });
    }

    return res.status(405).json({ erro: "Email ou senha inválidas" });
  } else {
    return res.status(405).json({ erro: "Metódo informado não é válido" });
  }
};

export default conectarMongoDB(endpointLogin);
