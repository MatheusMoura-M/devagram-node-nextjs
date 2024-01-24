import { conectarMongoDB } from "@/middlewares/conectarMongoDB";
import { UsuarioModel } from "@/models/usuarioModel";
import { upload, uploadImageCosmic } from "@/services/uploadImagemCosmic";
import { TCadastroRequisicao } from "@/types/cadastroRequisicao";
import { TRespostaPadrao } from "@/types/respostaPadrao";
import md5 from "md5";
import type { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

const handler = nc()
  .use(upload.single("file"))
  .post(async (req: NextApiRequest, res: NextApiResponse<TRespostaPadrao>) => {
    try {
      const usuario = req.body as TCadastroRequisicao;

      if (!usuario.nome || usuario.nome.length < 2) {
        return res.status(400).json({ erro: "Nome inválido" });
      }

      if (
        !usuario.email ||
        usuario.email.length < 5 ||
        !usuario.email.includes("@") ||
        !usuario.email.includes(".")
      ) {
        return res.status(400).json({ erro: "Email inválido" });
      }

      if (!usuario.senha || usuario.senha.length < 4) {
        return res.status(400).json({ erro: "Senha inválida" });
      }

      const usuarioComMesmoEmail = await UsuarioModel.find({
        email: usuario.email,
      });

      if (usuarioComMesmoEmail && usuarioComMesmoEmail.length > 0) {
        return res
          .status(400)
          .json({ erro: "Já existe um usuario com esse email" });
      }

      const image = await uploadImageCosmic(req);

      const usuarioASerSalvo = {
        nome: usuario.nome,
        email: usuario.email,
        senha: md5(usuario.senha),
        avatar: image?.media?.url,
      };

      await UsuarioModel.create(usuarioASerSalvo);

      return res.status(200).json({ msg: "Usuário criado com sucesso" });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ erro: "Erro ao cadastrar usuário" });
    }
  });

export const config = {
  api: {
    bodyParser: false,
  },
};

export default conectarMongoDB(handler);
