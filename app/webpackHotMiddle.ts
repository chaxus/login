import { PassThrough } from "stream";
import { type Middleware } from "koa";
import { type Compiler } from "webpack";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import expressHotMiddleware from "webpack-hot-middleware";

const webpackHotMiddleware = (
  compiler: Compiler,
  options?: { [key: string]: unknown }
) => {
  const middleware = expressHotMiddleware(compiler, options);

  const expressMiddleware: Middleware = async (context, next) => {
    const { req: request } = context;

    const stream = new PassThrough();

    await middleware(
      request,
      {
        end: (content: unknown) => {
          context.body = content;
        },
        write: stream.write.bind(stream),
        writeHead(
          status: number,
          headers: {
            [key: string]: string[] | string;
          }
        ) {
          context.body = stream;
          context.status = status;
          context.set(headers);
        },
      },
      next
    );
  };

  return expressMiddleware;
};

export default webpackHotMiddleware;
