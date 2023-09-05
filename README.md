# jacobparis.com

This is the source code for my personal website, [jacobparis.com](https://jacobparis.com)

## Colocation over Separation

I'm a big fan of colocating code by feature, rather than by type. Terms of art like "Domain Driven Design", "Feature folders", and "Vertical Slices" all describe approaches to the same philosophy.

Unlike most Remix apps, I use a custom routing system that foregoes the traditional `/routes` directory in favor of feature folders

Anywhere in `/app`, I can create a route by suffixing a file with `.route.tsx`. Any parent folders that the file may be in are of no consequence – only the filename is responsible for the route.

That means I can create a folder for `examples/remix-image-uploads` that contains the routes for the example as well as any supporting components or hooks.

**Next steps:** I want to be able to include my markdown blog posts in the same folder. Currently they're all in a /content folder, but I'd like to be able to colocate them with the code that they're describing, creating fully self contained examples.

**Next step:** I want to be able to resolve relative images in my markdown files, so a markdown file that can either link to an image in the same directory, or import it and use the import path as an image source

## Deployment

This site is deployed to [Fly](https://fly.io) with staging and production environments.

For staging:

```bash
fly deploy --config fly.staging.toml
```

For production:

```bash
fly deploy
```
