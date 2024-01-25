import { conectarMongoDB } from "@/middlewares/conectarMongoDB";
import { validarTokenJWT } from "@/middlewares/validarTokenJWT";
import { PublicacaoModel } from "@/models/publicacaoModel";
import { UsuarioModel } from "@/models/usuarioModel";
import { upload, uploadImageCosmic } from "@/services/uploadImagemCosmic";
import { TRespostaPadrao } from "@/types/respostaPadrao";
import { NextApiResponse } from "next";
import nc from "next-connect";

const handler = nc()
  .use(upload.single("file"))
  .post(async (req: any, res: NextApiResponse<TRespostaPadrao>) => {
    try {
      const { userId } = req.query;

      const usuario = await UsuarioModel.findById(userId);

      if (!usuario) {
        return res.status(400).json({ erro: "Usuário não encontrado" });
      }

      const { descricao } = req.body;

      if (!descricao || descricao.length === 2) {
        return res.status(400).json({ erro: "Descrição não é válida" });
      }

      if (!req.file || !req.file.originalname) {
        return res.status(400).json({ erro: "Imagem é obrigatória" });
      }

      const image = await uploadImageCosmic(req);

      const publicacao = {
        idUsuario: usuario._id,
        descricao,
        foto: image.media.url,
        data: new Date(),
      };

      usuario.publicacoes++;
      await UsuarioModel.findByIdAndUpdate({ _id: usuario._id }, usuario);

      await PublicacaoModel.create(publicacao);

      return res.status(200).json({ msg: "Publicação criada com sucesso" });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ erro: "Erro ao cadastrar publicação" });
    }
  });

export const config = {
  api: {
    bodyParser: false,
  },
};

export default validarTokenJWT(conectarMongoDB(handler));
