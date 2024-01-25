import { conectarMongoDB } from "@/middlewares/conectarMongoDB";
import { validarTokenJWT } from "@/middlewares/validarTokenJWT";
import { UsuarioModel } from "@/models/usuarioModel";
import { upload, uploadImageCosmic } from "@/services/uploadImagemCosmic";
import { TRespostaPadrao } from "@/types/respostaPadrao";
import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

const handler = nc()
  .use(upload.single("file"))
  .put(async (req: any, res: NextApiResponse<TRespostaPadrao>) => {
    try {
      const { userId } = req.query;

      const usuario = await UsuarioModel.findById(userId);

      if (!usuario) {
        return res.status(400).json({ erro: "Usuário não foi encontrado" });
      }

      const { nome } = req.body;

      if (nome && nome.length > 2) {
        usuario.nome = nome;
      }

      const { file } = req;

      if (file && file.originalname) {
        const image = await uploadImageCosmic(req);

        if (image && image.media && image.media.url) {
          usuario.avatar = image.media.url;
        }
      }

      await UsuarioModel.findByIdAndUpdate({ _id: usuario._id }, usuario);

      return res.status(200).json({ msg: "Usuário alterado com sucesso" });
    } catch (e) {
      console.error(e);

      return res
        .status(500)
        .json({ erro: "Não foi possível alterar usuário" + e });
    }
  })
  .get(
    async (
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

        return res
          .status(500)
          .json({ erro: "Não foi possível obter dados do usuário" + e });
      }
    }
  );

export const config = {
  api: {
    bodyParser: false,
  },
};

export default validarTokenJWT(conectarMongoDB(handler));
