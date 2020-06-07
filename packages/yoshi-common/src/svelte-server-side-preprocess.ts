import path from 'path';
import { SRC_DIR } from 'yoshi-config/build/paths';

export default function ({
  packageName,
  cwd,
}: {
  packageName: string;
  cwd: string;
}) {
  // Lookbehind assertions are supported in node v9.x.x and above.
  // By putting the regex inside the preprocessor, this isn't going to throw
  // errors for those that use Node v8.x.x.
  const scriptRegex = /(?<=<script>)((.|\n|\r)*)(?=<\/script>)/;

  return {
    markup: ({ content, filename }: { content: string; filename: string }) => {
      const scriptContent = scriptRegex.exec(content);
      const relativePath = path.relative(path.join(cwd, SRC_DIR), filename);
      const injectedCode = /* js */ `

      const modulesContext = require('svelte').getContext('__modules__')

      if (modulesContext) {
        modulesContext(module, '${packageName}', '${relativePath}')
      }

    `;
      // Source has a <script> tag
      if (scriptContent) {
        return {
          code: content.replace(scriptRegex, `${injectedCode} $1`),
        };
      }

      // Source doesn't have a <script> tag
      return {
        code: `<script>${injectedCode}</script>\n\n${content}`,
      };
    },
  };
}
